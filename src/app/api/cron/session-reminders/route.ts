import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToOwner } from "@/lib/push/server";
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
    .select("id, owner_id, time, status, reminder_sent_at, clients(name)")
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
    due.map(async (session) => {
      const clientName = (session as unknown as { clients?: { name?: string } | null }).clients?.name ?? "cliente";
      await sendPushToOwner(session.owner_id, {
        title: "Sessão em breve",
        body: `${clientName} às ${session.time} (em até ${REMINDER_MINUTES_BEFORE} min).`,
        url: "/dashboard",
      });
      await admin.from("sessions").update({ reminder_sent_at: new Date().toISOString() }).eq("id", session.id);
    })
  );

  return NextResponse.json({ checked: sessions?.length ?? 0, remindersSent: due.length, timeZone: APP_TIME_ZONE });
}
