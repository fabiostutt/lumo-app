import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: "active",
            })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: subscription.status })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
