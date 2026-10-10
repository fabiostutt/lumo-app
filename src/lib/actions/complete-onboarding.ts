"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/plan";
import { revalidatePath } from "next/cache";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type CompleteOnboardingState = { error?: string } | null;

export async function completeOnboardingAction(
  _prevState: CompleteOnboardingState,
  formData: FormData
): Promise<CompleteOnboardingState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  await getOrCreateProfile();

  const specialty = String(formData.get("specialty") || "").trim();
  const workDaysRaw = formData.getAll("workDays").map(String);
  const workDays = workDaysRaw.filter((d) => (WEEKDAYS as readonly string[]).includes(d));
  const workHoursFrom = String(formData.get("workHoursFrom") || "").trim();
  const workHoursTo = String(formData.get("workHoursTo") || "").trim();
  const durationRaw = String(formData.get("defaultDurationMinutes") || "").trim();
  const duration = Number(durationRaw);
  const nextPath = String(formData.get("nextPath") || "/dashboard").trim();

  if (durationRaw && (!Number.isFinite(duration) || duration <= 0)) {
    return { error: "Duração inválida" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      specialty: specialty || null,
      work_days: workDays.length > 0 ? workDays : null,
      work_hours_from: workHoursFrom || null,
      work_hours_to: workHoursTo || null,
      ...(durationRaw ? { default_duration_minutes: duration } : {}),
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  redirect(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard");
}
