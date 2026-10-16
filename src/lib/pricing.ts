// Utilitários puros de preço — sem "use client"/"use server", pra poder ser
// usado tanto no cliente (pricing, checkout, paywall) quanto no servidor.
// Nunca hardcode valores aqui: tudo recebe os centavos vindos de /api/pricing.

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export type Savings =
  | { type: "months_free"; months: number }
  | { type: "percent"; percent: number }
  | null;

// meses grátis = (12 * mensal - anual) / mensal. Se for inteiro e >= 1,
// "N meses grátis"; senão, "Economize X% no plano anual" (X arredondado);
// se o anual não for menor que 12x o mensal, não mostra chip (null).
export function getSavings(monthlyCents: number, annualCents: number): Savings {
  if (monthlyCents <= 0 || annualCents >= monthlyCents * 12) {
    return null;
  }

  const monthsFree = (12 * monthlyCents - annualCents) / monthlyCents;
  if (Number.isInteger(monthsFree) && monthsFree >= 1) {
    return { type: "months_free", months: monthsFree };
  }

  const percent = Math.round((1 - annualCents / 12 / monthlyCents) * 100);
  return { type: "percent", percent };
}

export function formatSavingsLabel(savings: Savings): string | null {
  if (!savings) return null;
  if (savings.type === "months_free") {
    const unit = savings.months === 1 ? "mês" : "meses";
    return `${savings.months} ${unit} grátis no plano anual`;
  }
  return `Economize ${savings.percent}% no plano anual`;
}

// Quanto o plano anual economiza em relação a pagar o mensal 12x (em
// centavos) — null se o anual não for mais barato.
export function getSavingsAmountCents(monthlyCents: number, annualCents: number): number | null {
  const amount = monthlyCents * 12 - annualCents;
  return amount > 0 ? amount : null;
}
