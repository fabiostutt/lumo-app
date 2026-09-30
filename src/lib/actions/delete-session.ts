"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteCalendarEvent, getValidGoogleAccessToken } from "@/lib/google/calendar";
import { sendSessionCancelledMessage } from "@/lib/whatsapp";

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
    .select("id, date, time, google_event_id, notifications_enabled, platform, clients(name, whatsapp)");

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Sessão não encontrada");

  const deleted = data[0] as unknown as {
    id: string;
    date: string;
    time: string;
    google_event_id: string | null;
    notifications_enabled: boolean;
    platform: string;
    clients: { name: string; whatsapp: string | null } | null;
  };

  if (deleted.google_event_id) {
    try {
      const accessToken = await getValidGoogleAccessToken(user.id);
      if (accessToken) await deleteCalendarEvent(accessToken, deleted.google_event_id);
    } catch (err) {
      // Sessão já foi excluída — um evento órfão no Google Calendar não é
      // motivo para falhar a exclusão.
      console.error("[delete-session] Falha ao excluir evento no Google Calendar:", err);
    }
  }

  if (deleted.notifications_enabled && deleted.platform === "WhatsApp" && deleted.clients?.whatsapp) {
    const [, month, day] = deleted.date.split("-");
    try {
      await sendSessionCancelledMessage({
        toRaw: deleted.clients.whatsapp,
        clientName: deleted.clients.name,
        date: `${day}/${month}`,
        time: deleted.time.slice(0, 5),
        sessionId: deleted.id,
      });
    } catch (err) {
      // Sessão já foi excluída — uma falha no envio do WhatsApp não é motivo
      // para falhar a exclusão.
      console.error("[delete-session] Falha ao enviar cancelamento por WhatsApp:", err);
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
