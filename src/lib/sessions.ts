import { createClient } from "@/lib/supabase/server";

export async function getSessionById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select("id, client_id, date, time, notifications_enabled, meeting_link, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) return null;
  return data;
}
