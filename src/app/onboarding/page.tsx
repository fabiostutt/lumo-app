import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, needsOnboarding } from "@/lib/plan";
import OnboardingFlow from "@/components/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getOrCreateProfile();

  if (!needsOnboarding(profile)) redirect("/dashboard");

  return <OnboardingFlow />;
}
