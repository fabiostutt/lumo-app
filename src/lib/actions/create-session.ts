"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClientById } from "@/lib/clients";
import { sendSessionConfirmationMessage } from "@/lib/whatsapp";
import { createCalendarEvent, getValidGoogleAccessToken } from "@/lib/google/calendar";

const SESSION_DURATION_MINUTES = 60;
const APP_TIME_ZONE = "America/Sao_Paulo";

export async function createSessionAction(formData: FormData) {
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

  if (!clientId || !date || !time) {
    throw new Error("Preencha participante, data e hora");
  }

  const client = await getClientById(clientId);
  let googleEventId: string | null = null;

  if (notificationsEnabled && platform === "google") {
    if (client?.email) {
      try {
        const accessToken = await getValidGoogleAccessToken(user.id);
        if (!accessToken) {
          console.warn(
            `[create-session] Usuário ${user.id} não tem o Google Calendar conectado (faça login novamente para autorizar).`
          );
        } else {
          const timeHHMM = time.slice(0, 5);
          const start = new Date(`${date}T${timeHHMM}:00-03:00`);
          const end = new Date(start.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

          const event = await createCalendarEvent({
            accessToken,
            summary: `Sessão com ${client.name}`,
            description: "Sessão agendada via Lumo.",
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
            timeZone: APP_TIME_ZONE,
            attendeeEmail: client.email,
          });

          googleEventId = event.id;
          meetingLink = event.hangoutLink || event.htmlLink;
        }
      } catch (err) {
        // Não deixamos uma falha no Google Calendar derrubar o agendamento.
        console.error("[create-session] Falha ao criar evento no Google Calendar:", err);
      }
    } else {
      console.warn(
        `[create-session] Notificações via Google ligadas, mas cliente ${clientId} não tem e-mail cadastrado.`
      );
    }
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      owner_id: user.id,
      client_id: clientId,
      date,
      time,
      platform: platform === "google" ? "Google" : "WhatsApp",
      status: "pendente",
      notifications_enabled: notificationsEnabled,
      meeting_link: meetingLink || null,
      google_event_id: googleEventId,
    })
    .select("id")
    .single();

  if (error) throw error;

  if (notificationsEnabled && platform === "whatsapp" && client?.whatsapp) {
    const [, month, day] = date.split("-");
    try {
      await sendSessionConfirmationMessage({
        toRaw: client.whatsapp,
        clientName: client.name,
        date: `${day}/${month}`,
        time: time.slice(0, 5),
        sessionId: data.id,
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
