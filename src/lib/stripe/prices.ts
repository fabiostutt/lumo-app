// .trim() é defensivo — env vars coladas em painéis (Vercel, etc.) às vezes
// carregam um caractere de controle (quebra de linha) junto, o que faz a
// Stripe API rejeitar a URL inteira com "forbidden characters '..' or
// control characters" em vez de um erro claro de "price not found".
export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!.trim(),
  yearly: process.env.STRIPE_PRICE_YEARLY!.trim(),
};
