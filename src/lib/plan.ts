import { createClient } from "@/lib/supabase/server";

const TRIAL_DAYS = 14;
export const FREE_CLIENT_LIMIT = 5;

export type Profile = {
  id: string;
  trial_ends_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
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

export function getEffectivePlan(profile: Profile): "pro" | "free" {
  if (profile.subscription_status === "active" || profile.subscription_status === "trialing") {
    return "pro";
  }
  if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
    return "pro";
  }
  return "free";
}
