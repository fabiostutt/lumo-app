import { createClient } from "@/lib/supabase/server";
import type { SessionStatus } from "@/components/MeetingDetailsSheet";
import { getOrCreateProfile, FREE_CLIENT_LIMIT } from "@/lib/plan";
import { getServerDisclaimerTone } from "@/lib/disclaimer";

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

// A prática roda em horário de Brasília — calcular "hoje"/"agora" a partir do
// relógio local do servidor quebra em produção, onde o processo costuma
// rodar em UTC (uma sessão às 22h BRT parecia "no passado" às 22h UTC, que
// ainda são 19h em Brasília).
export const APP_TIME_ZONE = "America/Sao_Paulo";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getNowInAppTimeZone() {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return { dateStr, timeStr };
}

type SessionRow = {
  id: string;
  date: string;
  time: string;
  notifications_enabled: boolean | null;
  status: string | null;
  meeting_link: string | null;
  clients: { name: string; whatsapp: string | null } | null;
};

function mapRow(s: SessionRow) {
  return {
    id: s.id,
    time: s.time.slice(0, 5),
    date: s.date,
    clientName: s.clients?.name ?? "Cliente",
    clientWhatsapp: s.clients?.whatsapp ?? null,
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

  const { dateStr: todayStr, timeStr: currentTime } = getNowInAppTimeZone();
  const today = new Date(`${todayStr}T00:00:00`);

  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const sessionSelect =
    "id, date, time, notifications_enabled, status, meeting_link, clients(name, whatsapp)";

  const [weekResult, todayResult, nextResult, clientCountResult, profile] = await Promise.all([
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
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    getOrCreateProfile(),
  ]);

  if (weekResult.error) throw weekResult.error;
  if (todayResult.error) throw todayResult.error;
  if (nextResult.error) throw nextResult.error;
  if (clientCountResult.error) throw clientCountResult.error;

  const clientCount = clientCountResult.count ?? 0;
  const disclaimerTone = getServerDisclaimerTone({
    subscriptionStatus: profile.subscription_status,
    trialEndsAt: profile.trial_ends_at,
    clientCount,
    clientLimit: FREE_CLIENT_LIMIT,
  });

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
    month: MONTH_LABELS[today.getMonth()],
    weekDays,
    nextMeeting,
    meetings,
    initialEventDates: eventDates,
    disclaimerTone,
    disclaimerClientCount: clientCount,
  };
}
