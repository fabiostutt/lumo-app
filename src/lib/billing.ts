// Utilitários puros de cobrança do trial — sem "use client"/"use server",
// usados tanto nas páginas (exibição) quanto na Server Action/rota de
// checkout (decisão de cobrar na hora ou no fim do trial).

// Se faltar menos que isso pro trial acabar, trata como já vencido — evita
// mandar um trial_end pra Stripe que já pode estar no passado no instante
// em que a requisição chega lá (corrida entre o cliente calcular e a Stripe
// processar).
export const TRIAL_SAFETY_BUFFER_MS = 5 * 60 * 1000;

export function isTrialActive(trialEndsAt: string | null, now: Date = new Date()): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() - now.getTime() > TRIAL_SAFETY_BUFFER_MS;
}

export function formatChargeDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}
