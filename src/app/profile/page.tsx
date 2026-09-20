import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/plan";
import ProfileScreen from "@/components/ProfileScreen";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getOrCreateProfile();

  return (
    <ProfileScreen
      name={user.user_metadata?.full_name ?? "Usuário"}
      email={user.email ?? ""}
      avatarUrl={user.user_metadata?.avatar_url ?? null}
      whatsapp={profile.whatsapp}
      professionalName={profile.professional_name}
      specialty={profile.specialty}
      defaultDurationMinutes={profile.default_duration_minutes}
      defaultSessionType={profile.default_session_type}
    />
  );
}
