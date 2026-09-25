"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClientById } from "@/lib/clients";
import { sendSessionConfirmationMessage } from "@/lib/whatsapp";
import { createCalendarEvent, getValidGoogleAccessToken } from "@/lib/google/calendar";
import {
  findConflicts,
  formatConflictsMessage,
  generateRecurrenceDatesForPreset,
  RECURRENCE_PRESET_LABELS,
  type RecurrencePreset,
} from "@/lib/scheduling";

const APP_TIME_ZONE = "America/Sao_Paulo";

export type CreateSessionState = { error?: string } | null;

export async function createSessionAction(
  _prevState: CreateSessionState,
  formData: FormData
): Promise<CreateSessionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const clientId = String(formData.get("clientId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const platform = formData.get("platform") === "google" ? "google" : "whatsapp";
  let meetingLink = String(formData.get("meetingLink") || "").trim();
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";
  const durationMinutes = Number(formData.get("duration")) || 50;
  const submittedPreset = String(formData.get("recurrencePreset") || "none");
  const recurrencePreset: RecurrencePreset =
    submittedPreset in RECURRENCE_PRESET_LABELS ? (submittedPreset as RecurrencePreset) : "none";

  if (!clientId || !date || !time) {
    return { error: "Preencha participante, data e hora" };
  }

  const client = await getClientById(clientId);

  const occurrenceDates = generateRecurrenceDatesForPreset(date, recurrencePreset);
  const isRecurring = occurrenceDates.length > 1;
  const recurrenceGroupId = isRecurring ? crypto.randomUUID() : null;

  // Conflito é checado contra TODAS as ocorrências da série de uma vez, antes
  // de criar qualquer coisa — evita criar metade da série e falhar no meio.
  const { data: existingSessions } = await supabase
    .from("sessions")
    .select("id, date, time, duration_minutes, clients(name)")
    .eq("owner_id", user.id)
    .neq("status", "cancelada")
    .in("date", occurrenceDates);

  const conflicts = findConflicts(
    occurrenceDates.map((d) => ({ date: d, time, durationMinutes })),
    (existingSessions ?? []) as unknown as Parameters<typeof findConflicts>[1]
  );

  if (conflicts.length > 0) {
    return { error: formatConflictsMessage(conflicts) };
  }

  const timeHHMM = time.slice(0, 5);

  // Um evento no Google Calendar por ocorrência, criados em paralelo — em
  // série, uma recorrência de 12 sessões facilmente estouraria o timeout da
  // função serverless.
  const calendarResults = await Promise.all(
    occurrenceDates.map(async (occurrenceDate) => {
      if (!notificationsEnabled || platform !== "google" || !client?.email) return null;

      try {
        const accessToken = await getValidGoogleAccessToken(user.id);
        if (!accessToken) {
          console.warn(
            `[create-session] Usuário ${user.id} não tem o Google Calendar conectado (faça login novamente para autorizar).`
          );
          return null;
        }

        const start = new Date(`${occurrenceDate}T${timeHHMM}:00-03:00`);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

        const event = await createCalendarEvent({
          accessToken,
          summary: `Sessão com ${client.name}`,
          description: "Sessão agendada via Lumo.",
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
          timeZone: APP_TIME_ZONE,
          attendeeEmail: client.email,
        });

        return { eventId: event.id, link: event.hangoutLink || event.htmlLink };
      } catch (err) {
        // Não deixamos uma falha no Google Calendar derrubar o agendamento.
        console.error(`[create-session] Falha ao criar evento no Google Calendar (${occurrenceDate}):`, err);
        return null;
      }
    })
  );

  if (platform === "google" && calendarResults[0]?.link) {
    meetingLink = calendarResults[0].link;
  }

  const rows = occurrenceDates.map((occurrenceDate, index) => ({
    owner_id: user.id,
    client_id: clientId,
    date: occurrenceDate,
    time,
    duration_minutes: durationMinutes,
    platform: platform === "google" ? "Google" : "WhatsApp",
    status: "pendente",
    notifications_enabled: notificationsEnabled,
    meeting_link: platform === "google" ? calendarResults[index]?.link ?? null : meetingLink || null,
    google_event_id: calendarResults[index]?.eventId ?? null,
    recurrence_group_id: recurrenceGroupId,
    recurrence_rule: isRecurring ? { preset: recurrencePreset } : null,
  }));

  const { data: inserted, error } = await supabase.from("sessions").insert(rows).select("id, date");

  if (error) throw error;

  const firstOccurrence = inserted?.find((row) => row.date === date);

  // Confirmação por WhatsApp só na primeira ocorrência — mandar N mensagens
  // de uma vez pro mesmo cliente na criação de uma série seria spam.
  if (notificationsEnabled && platform === "whatsapp" && client?.whatsapp && firstOccurrence) {
    const [, month, day] = date.split("-");
    try {
      await sendSessionConfirmationMessage({
        toRaw: client.whatsapp,
        clientName: client.name,
        date: `${day}/${month}`,
        time: timeHHMM,
        sessionId: firstOccurrence.id,
      });
    } catch (err) {
      // Não deixamos uma falha no envio do WhatsApp derrubar o agendamento —
      // a sessão já foi criada com sucesso.
      console.error("[create-session] Falha ao enviar confirmação por WhatsApp:", err);
    }
  } else if (notificationsEnabled && platform === "whatsapp" && !client?.whatsapp) {
    console.warn(
      `[create-session] Notificações ligadas, mas cliente ${clientId} não tem WhatsApp cadastrado.`
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
