import { createClient } from "@/lib/supabase/server";
import type { SessionStatus } from "@/components/MeetingDetailsSheet";

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const now = new Date();
  const todayStr = toISO(now);
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const { data: weekSessions, error: weekError } = await supabase
    .from("sessions")
    .select("date")
    .eq("owner_id", user.id)
    .gte("date", toISO(monday))
    .lte("date", toISO(sunday));

  if (weekError) throw weekError;

  const eventDates = Array.from(new Set((weekSessions ?? []).map((s) => s.date as string)));
  const eventDatesSet = new Set(eventDates);

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, date, time, notifications_enabled, status, meeting_link, clients(name)")
    .eq("owner_id", user.id)
    .eq("date", todayStr)
    .order("time", { ascending: true });

  if (error) throw error;

  const meetings = (sessions ?? []).map((s) => ({
    id: s.id,
    time: (s.time as string).slice(0, 5),
    date: s.date as string,
    clientName: (s.clients as unknown as { name: string })?.name ?? "Cliente",
    status: (s.status as SessionStatus) ?? "pendente",
    notificationsOn: s.notifications_enabled ?? false,
    meetingUrl: s.meeting_link ?? null,
  }));

  // "Próxima sessão" = primeira sessão de HOJE que ainda não aconteceu.
  // Se todas já passaram, não há próxima sessão (fica null).
  const nextIndex = meetings.findIndex((m) => m.time >= currentTime);
  const nextMeeting = nextIndex === -1 ? null : meetings[nextIndex];
  const rest = nextIndex === -1 ? meetings : meetings.filter((_, i) => i !== nextIndex);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toISO(d);
    return {
      label: WEEKDAY_LABELS[i],
      date: d.getDate(),
      selected: iso === todayStr,
      hasEvent: eventDatesSet.has(iso),
    };
  });

  return {
    userName: user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário",
    sessionsToday: meetings.length,
    month: MONTH_LABELS[now.getMonth()],
    weekDays,
    nextMeeting,
    meetings: rest,
    initialEventDates: eventDates,
  };
}
