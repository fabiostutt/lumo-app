"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClientById } from "@/lib/clients";
import { sendSessionConfirmationMessage } from "@/lib/whatsapp";

export async function createSessionAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const clientId = String(formData.get("clientId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const meetingLink = String(formData.get("meetingLink") || "").trim();
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  if (!clientId || !date || !time) {
    throw new Error("Preencha participante, data e hora");
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      owner_id: user.id,
      client_id: clientId,
      date,
      time,
      status: "pendente",
      notifications_enabled: notificationsEnabled,
      meeting_link: meetingLink || null,
    })
    .select("id")
    .single();

  if (error) throw error;

  if (notificationsEnabled) {
    const client = await getClientById(clientId);

    if (client?.whatsapp) {
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
    } else {
      console.warn(
        `[create-session] Notificações ligadas, mas cliente ${clientId} não tem WhatsApp cadastrado.`
      );
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
