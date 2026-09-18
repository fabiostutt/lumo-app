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

type SessionRow = {
  id: string;
  date: string;
  time: string;
  notifications_enabled: boolean | null;
  status: string | null;
  meeting_link: string | null;
  clients: { name: string } | null;
};

function mapRow(s: SessionRow) {
  return {
    id: s.id,
    time: s.time.slice(0, 5),
    date: s.date,
    clientName: s.clients?.name ?? "Cliente",
    status: (s.status as SessionStatus) ?? "pendente",
    notificationsOn: s.notifications_enabled ?? false,
    meetingUrl: s.meeting_link ?? null,
  };
}

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const now = new Date();
  const todayStr = toISO(now);
  const currentTime = now.toTimeString().slice(0, 5);

  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const sessionSelect = "id, date, time, notifications_enabled, status, meeting_link, clients(name)";

  const [weekResult, todayResult, nextResult] = await Promise.all([
    supabase
      .from("sessions")
      .select("date")
      .eq("owner_id", user.id)
      .gte("date", toISO(monday))
      .lte("date", toISO(sunday)),
    supabase
      .from("sessions")
      .select(sessionSelect)
      .eq("owner_id", user.id)
      .eq("date", todayStr)
      .order("time", { ascending: true }),
    supabase
      .from("sessions")
      .select(sessionSelect)
      .eq("owner_id", user.id)
      .or(`date.gt.${todayStr},and(date.eq.${todayStr},time.gte.${currentTime})`)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(1),
  ]);

  if (weekResult.error) throw weekResult.error;
  if (todayResult.error) throw todayResult.error;
  if (nextResult.error) throw nextResult.error;

  const eventDates = Array.from(new Set((weekResult.data ?? []).map((s) => s.date as string)));
  const eventDatesSet = new Set(eventDates);

  const meetings = (todayResult.data ?? []).map((s) => mapRow(s as unknown as SessionRow));

  const nextMeeting =
    nextResult.data && nextResult.data.length > 0
      ? mapRow(nextResult.data[0] as unknown as SessionRow)
      : null;

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
    meetings,
    initialEventDates: eventDates,
  };
}
