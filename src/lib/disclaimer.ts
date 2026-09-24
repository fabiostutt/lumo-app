export type DisclaimerTone =
  | "notification"
  | "lumo-pro"
  | "two-days"
  | "last-day"
  | "growth"
  | "client-limit"
  | "payment-failed";

const GROWTH_CLIENT_THRESHOLD = 4;
const FAILED_PAYMENT_STATUSES = new Set(["past_due", "unpaid"]);

// Não inclui "notification" (decidido no client, pela permissão do navegador)
// nem o gate de "sessão de retorno" do "lumo-pro" (também client-only) — ver
// Disclaimer.tsx, que combina este resultado com esses dois sinais.
export type ServerDisclaimerTone = Exclude<DisclaimerTone, "notification">;

export function getServerDisclaimerTone({
  subscriptionStatus,
  trialEndsAt,
  clientCount,
  clientLimit,
  now = new Date(),
}: {
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  clientCount: number;
  clientLimit: number;
  now?: Date;
}): ServerDisclaimerTone | null {
  if (subscriptionStatus && FAILED_PAYMENT_STATUSES.has(subscriptionStatus)) {
    return "payment-failed";
  }

  const hasPaidSubscription = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  if (hasPaidSubscription) return null;

  if (trialEndsAt) {
    const hoursRemaining = (new Date(trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursRemaining > 0 && hoursRemaining <= 24) return "last-day";
    if (hoursRemaining > 24 && hoursRemaining <= 48) return "two-days";
  }

  if (clientCount >= clientLimit) return "client-limit";
  if (clientCount >= GROWTH_CLIENT_THRESHOLD) return "growth";

  return "lumo-pro";
}
