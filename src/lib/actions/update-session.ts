"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClientById } from "@/lib/clients";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getValidGoogleAccessToken,
  updateCalendarEvent,
} from "@/lib/google/calendar";
import { findConflicts, formatConflictsMessage } from "@/lib/scheduling";

const APP_TIME_ZONE = "America/Sao_Paulo";

export type UpdateSessionState = { error?: string } | null;

export async function updateSessionAction(
  _prevState: UpdateSessionState,
  formData: FormData
): Promise<UpdateSessionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const sessionId = String(formData.get("sessionId") || "");
  const clientId = String(formData.get("clientId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const platform = formData.get("platform") === "google" ? "google" : "whatsapp";
  let meetingLink = String(formData.get("meetingLink") || "").trim();
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";
  const durationMinutes = Number(formData.get("duration")) || 50;

  if (!sessionId || !clientId || !date || !time) {
    return { error: "Preencha participante, data e hora" };
  }

  const { data: existingSessions } = await supabase
    .from("sessions")
    .select("id, date, time, duration_minutes, clients(name)")
    .eq("owner_id", user.id)
    .neq("status", "cancelada")
    .eq("date", date);

  const conflicts = findConflicts(
    [{ date, time, durationMinutes }],
    (existingSessions ?? []) as unknown as Parameters<typeof findConflicts>[1],
    sessionId
  );

  if (conflicts.length > 0) {
    return { error: formatConflictsMessage(conflicts) };
  }

  const { data: existing } = await supabase
    .from("sessions")
    .select("google_event_id")
    .eq("id", sessionId)
    .eq("owner_id", user.id)
    .single();

  const existingEventId = existing?.google_event_id ?? null;
  let googleEventId = existingEventId;

  const client = await getClientById(clientId);
  const wantsGoogleSync = notificationsEnabled && platform === "google" && !!client?.email;

  if (wantsGoogleSync) {
    try {
      const accessToken = await getValidGoogleAccessToken(user.id);
      if (!accessToken) {
        console.warn(
          `[update-session] Usuário ${user.id} não tem o Google Calendar conectado (faça login novamente para autorizar).`
        );
      } else {
        const timeHHMM = time.slice(0, 5);
        const start = new Date(`${date}T${timeHHMM}:00-03:00`);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

        if (existingEventId) {
          const event = await updateCalendarEvent(accessToken, existingEventId, {
            summary: `Sessão com ${client!.name}`,
            description: "Sessão agendada via Lumo.",
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
            timeZone: APP_TIME_ZONE,
            attendeeEmail: client!.email,
          });
          meetingLink = event.hangoutLink || event.htmlLink || meetingLink;
        } else {
          const event = await createCalendarEvent({
            accessToken,
            summary: `Sessão com ${client!.name}`,
            description: "Sessão agendada via Lumo.",
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
            timeZone: APP_TIME_ZONE,
            attendeeEmail: client!.email,
          });
          googleEventId = event.id;
          meetingLink = event.hangoutLink || event.htmlLink;
        }
      }
    } catch (err) {
      // Não deixamos uma falha no Google Calendar derrubar a edição da sessão.
      console.error("[update-session] Falha ao sincronizar evento no Google Calendar:", err);
    }
  } else if (existingEventId) {
    // Deixou de ser uma sessão "Google com notificações" (mudou de
    // plataforma, desligou notificações, ou o cliente ficou sem e-mail) —
    // o evento antigo não faz mais sentido.
    try {
      const accessToken = await getValidGoogleAccessToken(user.id);
      if (accessToken) await deleteCalendarEvent(accessToken, existingEventId);
    } catch (err) {
      console.error("[update-session] Falha ao excluir evento antigo no Google Calendar:", err);
    }
    googleEventId = null;
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({
      client_id: clientId,
      date,
      time,
      duration_minutes: durationMinutes,
      platform: platform === "google" ? "Google" : "WhatsApp",
      notifications_enabled: notificationsEnabled,
      meeting_link: meetingLink || null,
      google_event_id: googleEventId,
    })
    .eq("id", sessionId)
    .eq("owner_id", user.id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Sessão não encontrada");

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
