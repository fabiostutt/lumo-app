import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "missing date" }, { status: 400 });
  }

  const selected = new Date(`${dateParam}T00:00:00`);
  const dayOfWeek = selected.getDay();
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const { data: weekSessions, error: weekError } = await supabase
    .from("sessions")
    .select("date")
    .eq("owner_id", user.id)
    .gte("date", toISO(monday))
    .lte("date", toISO(sunday));

  if (weekError) {
    return NextResponse.json({ error: weekError.message }, { status: 500 });
  }

  const eventDates = Array.from(new Set((weekSessions ?? []).map((s) => s.date as string)));

  const { data: daySessions, error: dayError } = await supabase
    .from("sessions")
    .select("id, date, time, notifications_enabled, status, meeting_link, clients(name, whatsapp)")
    .eq("owner_id", user.id)
    .eq("date", dateParam)
    .order("time", { ascending: true });

  if (dayError) {
    return NextResponse.json({ error: dayError.message }, { status: 500 });
  }

  const meetings = (daySessions ?? []).map((s) => ({
    id: s.id,
    time: (s.time as string).slice(0, 5),
    date: s.date as string,
    clientName: (s.clients as unknown as { name: string; whatsapp: string | null })?.name ?? "Cliente",
    clientWhatsapp: (s.clients as unknown as { name: string; whatsapp: string | null })?.whatsapp ?? null,
    status: (s.status as "pendente" | "confirmada" | "cancelada") ?? "pendente",
    notificationsOn: s.notifications_enabled ?? false,
    meetingUrl: s.meeting_link ?? null,
  }));

  return NextResponse.json({
    eventDates,
    sessionsToday: meetings.length,
    meetings,
  });
}
