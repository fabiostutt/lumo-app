import { stripe } from "@/lib/stripe/server";
import { PRICE_IDS } from "@/lib/stripe/prices";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Confere que o Price é recorrente e tem o intervalo esperado — sem
// fallback silencioso: se alguém apontar um Price avulso (one-time) ou com
// o intervalo errado nas env vars, isso tem que falhar alto, não cobrar o
// valor errado silenciosamente.
function assertRecurringInterval(price: Stripe.Price, expected: "month" | "year") {
  if (price.type !== "recurring" || !price.recurring) {
    throw new Error(`Price ${price.id} não é recorrente (type=${price.type})`);
  }
  if (price.recurring.interval !== expected) {
    throw new Error(
      `Price ${price.id} tem intervalo "${price.recurring.interval}", esperado "${expected}"`
    );
  }
}

export async function GET() {
  try {
    const [monthly, yearly] = await Promise.all([
      stripe.prices.retrieve(PRICE_IDS.monthly),
      stripe.prices.retrieve(PRICE_IDS.yearly),
    ]);

    assertRecurringInterval(monthly, "month");
    assertRecurringInterval(yearly, "year");

    return NextResponse.json({
      monthly: monthly.unit_amount,
      yearly: yearly.unit_amount,
      currency: monthly.currency,
    });
  } catch (err) {
    console.error("Erro ao buscar preços do Stripe:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
