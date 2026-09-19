"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteCalendarEvent, getValidGoogleAccessToken } from "@/lib/google/calendar";

export async function deleteSessionAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const sessionId = String(formData.get("sessionId") || "");
  if (!sessionId) throw new Error("Sessão inválida");

  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("owner_id", user.id)
    .select("id, google_event_id");

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Sessão não encontrada");

  const googleEventId = data[0].google_event_id;
  if (googleEventId) {
    try {
      const accessToken = await getValidGoogleAccessToken(user.id);
      if (accessToken) await deleteCalendarEvent(accessToken, googleEventId);
    } catch (err) {
      // Sessão já foi excluída — um evento órfão no Google Calendar não é
      // motivo para falhar a exclusão.
      console.error("[delete-session] Falha ao excluir evento no Google Calendar:", err);
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
