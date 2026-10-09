import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToOwner } from "@/lib/push/server";
import { sendSessionReminderMessage } from "@/lib/whatsapp";
import { APP_TIME_ZONE, getNowInAppTimeZone } from "@/lib/dashboard";

// Job agendado (ver vercel.json) que roda a cada poucos minutos e avisa o
// profissional pouco antes de cada sessão do dia — a Vercel injeta
// `Authorization: Bearer $CRON_SECRET` automaticamente quando o env var
// CRON_SECRET está configurado, então basta validar contra ele aqui.
const REMINDER_MINUTES_BEFORE = 15;

function minutesSinceMidnight(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const { dateStr, timeStr } = getNowInAppTimeZone();
  const nowMinutes = minutesSinceMidnight(timeStr);

  const { data: sessions, error } = await admin
    .from("sessions")
    .select("id, owner_id, date, time, status, reminder_sent_at, notifications_enabled, platform, clients(name, whatsapp)")
    .eq("date", dateStr)
    .is("reminder_sent_at", null)
    .neq("status", "cancelada");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (sessions ?? []).filter((session) => {
    const sessionMinutes = minutesSinceMidnight(session.time);
    const minutesUntil = sessionMinutes - nowMinutes;
    return minutesUntil > 0 && minutesUntil <= REMINDER_MINUTES_BEFORE;
  });

  await Promise.all(
    due.map(async (rawSession) => {
      const session = rawSession as unknown as {
        id: string;
        owner_id: string;
        date: string;
        time: string;
        notifications_enabled: boolean;
        platform: string;
        clients?: { name?: string; whatsapp?: string | null } | null;
      };
      const clientName = session.clients?.name ?? "cliente";

      await sendPushToOwner(session.owner_id, {
        title: "Sessão em breve",
        body: `${clientName} às ${session.time} (em até ${REMINDER_MINUTES_BEFORE} min).`,
        url: "/dashboard",
      });

      if (session.notifications_enabled && session.platform === "WhatsApp" && session.clients?.whatsapp) {
        try {
          await sendSessionReminderMessage({
            toRaw: session.clients.whatsapp,
            clientName,
            time: session.time.slice(0, 5),
            sessionId: session.id,
          });
        } catch (err) {
          console.error("[cron/session-reminders] Falha ao enviar lembrete por WhatsApp:", err);
        }
      }

      await admin.from("sessions").update({ reminder_sent_at: new Date().toISOString() }).eq("id", session.id);
    })
  );

  return NextResponse.json({ checked: sessions?.length ?? 0, remindersSent: due.length, timeZone: APP_TIME_ZONE });
}
