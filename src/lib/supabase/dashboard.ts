import { createClient } from "@/lib/supabase/server";

const WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, starts_at, notifications_on, confirmed, clients(name)")
    .eq("owner_id", user.id)
    .gte("starts_at", startOfDay)
    .lte("starts_at", endOfDay)
    .order("starts_at", { ascending: true });

  if (error) throw error;

  const meetings = (sessions ?? []).map((s) => ({
    id: s.id,
    time: new Date(s.starts_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    clientName: (s.clients as unknown as { name: string })?.name ?? "Cliente",
    notificationsOn: s.notifications_on,
    confirmed: s.confirmed,
  }));

  const [nextMeeting, ...rest] = meetings;

  // Semana atual (SEG a DOM) para o calendário
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = domingo
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