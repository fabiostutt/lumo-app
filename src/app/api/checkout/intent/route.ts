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
      expand: ["latest_invoice.confirmation_secret", "pending_setup_intent"],
      metadata: { supabase_user_id: user.id },
    });

    // Nesta versão da API da Stripe, o Invoice não tem mais campo
    // `payment_intent` — o client_secret vem em `confirmation_secret`
    // (https://docs.stripe.com/changelog/basil/2025-03-31/...). Quando o
    // Price tem período de teste, a primeira fatura é de R$ 0,00 e não há
    // nada a confirmar por essa via — a Stripe cria um SetupIntent em vez
    // disso, só para guardar o cartão e cobrar depois do trial.
    const invoice = subscription.latest_invoice as Stripe.Invoice | null;
    const pendingSetupIntent =
      typeof subscription.pending_setup_intent === "object"
        ? subscription.pending_setup_intent
        : null;

    const clientSecret = invoice?.confirmation_secret?.client_secret ?? pendingSetupIntent?.client_secret;
    const mode: "payment" | "setup" = invoice?.confirmation_secret ? "payment" : "setup";

    if (!clientSecret) {
      console.error("Assinatura sem client secret:", {
        subscriptionStatus: subscription.status,
        invoiceStatus: invoice?.status,
        invoiceAmountDue: invoice?.amount_due,
      });
      throw new Error("Stripe não retornou um client secret para o pagamento");
    }

    await createAdminClient()
      .from("profiles")
      .update({ stripe_subscription_id: subscription.id })
      .eq("id", user.id);

    return NextResponse.json({ clientSecret, mode, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Erro ao criar intenção de pagamento:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
