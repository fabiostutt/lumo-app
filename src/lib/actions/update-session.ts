"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateSessionAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const sessionId = String(formData.get("sessionId") || "");
  const clientId = String(formData.get("clientId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const meetingLink = String(formData.get("meetingLink") || "").trim();
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  if (!sessionId || !clientId || !date || !time) {
    throw new Error("Preencha participante, data e hora");
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      client_id: clientId,
      date,
      time,
      notifications_enabled: notificationsEnabled,
      meeting_link: meetingLink || null,
    })
    .eq("id", sessionId)
    .eq("owner_id", user.id);

  if (error) throw error;

  redirect("/dashboard");
}
