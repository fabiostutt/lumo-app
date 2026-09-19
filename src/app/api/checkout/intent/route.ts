import { stripe } from "@/lib/stripe/server";
import { PRICE_IDS } from "@/lib/stripe/prices";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateProfile } from "@/lib/plan";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const { plan, name, cpf, paymentMethodId } = await request.json();

  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Missing payment method" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await getOrCreateProfile();

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: name || undefined,
        metadata: { supabase_user_id: user.id, cpf: cpf || "" },
      });
      customerId = customer.id;
      await createAdminClient()
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    } else {
      await stripe.customers.update(customerId, {
        name: name || undefined,
        metadata: { cpf: cpf || "" },
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRICE_IDS[plan as "monthly" | "yearly"] }],
      default_payment_method: paymentMethodId,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: { supabase_user_id: user.id },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent;
    };
    const clientSecret = invoice.payment_intent?.client_secret;

    if (!clientSecret) {
      throw new Error("Stripe não retornou um client secret para o pagamento");
    }

    await createAdminClient()
      .from("profiles")
      .update({ stripe_subscription_id: subscription.id })
      .eq("id", user.id);

    return NextResponse.json({ clientSecret, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Erro ao criar intenção de pagamento:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
