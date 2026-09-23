import { createClient } from "@/lib/supabase/server";

const TRIAL_DAYS = 7;
export const FREE_CLIENT_LIMIT = 5;

export type Profile = {
  id: string;
  trial_ends_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  whatsapp: string | null;
  professional_name: string | null;
  specialty: string | null;
  default_duration_minutes: number;
  default_session_type: string;
};

export async function getOrCreateProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, trial_ends_at: trialEndsAt.toISOString() })
    .select("*")
    .single();

  if (error) throw error;
  return created as Profile;
}

// Assinatura Stripe de verdade (paga ou em trialing do próprio Stripe) —
// diferente do trial local de 7 dias (trial_ends_at), que não deve contar
// como "assinante" para gates como o limite de clientes do plano Free.
export function hasActiveSubscription(profile: Profile): boolean {
  return profile.subscription_status === "active" || profile.subscription_status === "trialing";
}

export function getEffectivePlan(profile: Profile): "pro" | "free" {
  if (hasActiveSubscription(profile)) {
    return "pro";
  }
  if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
    return "pro";
  }
  return "free";
}
