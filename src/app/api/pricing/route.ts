import { stripe } from "@/lib/stripe/server";
import { PRICE_IDS } from "@/lib/stripe/prices";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [monthly, yearly] = await Promise.all([
      stripe.prices.retrieve(PRICE_IDS.monthly),
      stripe.prices.retrieve(PRICE_IDS.yearly),
    ]);

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
