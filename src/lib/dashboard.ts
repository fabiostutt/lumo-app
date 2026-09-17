import { createClient } from "@/lib/supabase/server";

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, time, notifications_enabled, status, clients(name)")
    .eq("owner_id", user.id)
    .eq("date", todayStr)
    .order("time", { ascending: true });

  if (error) throw error;

  const meetings = (sessions ?? []).map((s) => ({
    id: s.id,
    time: (s.time as string).slice(0, 5), // "14:00:00" -> "14:00"
    clientName: (s.clients as unknown as { name: string })?.name ?? "Cliente",
    notificationsOn: s.notifications_enabled ?? false,
    confirmed: s.status === "confirmada",
  }));

  const [nextMeeting, ...rest] = meetings;

  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: WEEKDAY_LABELS[d.getDay()],
      date: d.getDate(),
      selected: d.toDateString() === now.toDateString(),
    };
  });

  return {
    userName: user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário",
    sessionsToday: meetings.length,
    month: MONTH_LABELS[now.getMonth()],
    weekDays,
    nextMeeting: nextMeeting ?? null,
    meetings: rest,
  };
}
