"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  EngineIcon,
  WatchIcon,
  AddUserIcon,
  PeopleIcon,
  OptionsIcon,
  VideoIcon,
  CircleCheckIcon,
  AlertIcon,
  CancelIcon,
} from "@/components/icons";
import MeetingDetailsSheet, { type SessionStatus } from "@/components/MeetingDetailsSheet";

const STATUS_CHIP_MAP: Record<
  SessionStatus,
  { bg: string; text: string; icon: (props: { size: number; className?: string }) => React.ReactElement }
> = {
  confirmada: {
    bg: "bg-[var(--feedback-success-subtlest,#efffe5)]",
    text: "text-[color:var(--feedback-success-strongest,#1b6303)]",
    icon: CircleCheckIcon,
  },
  pendente: {
    bg: "bg-[var(--feedback-warning-subtlest,#fefbed)]",
    text: "text-[color:var(--feedback-warning-strongest,#706121)]",
    icon: AlertIcon,
  },
  cancelada: {
    bg: "bg-[var(--feedback-danger-subtlest,#fbe8e8)]",
    text: "text-[color:var(--feedback-danger-strongest,#610d0d)]",
    icon: CancelIcon,
  },
};

const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function mondayOf(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
}

function buildWeekDays(selectedDateStr: string, eventDates: Set<string>) {
  const monday = mondayOf(selectedDateStr);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toISO(d);
    return {
      iso,
      label: WEEKDAY_LABELS[i],
      date: d.getDate(),
      selected: iso === selectedDateStr,
      hasEvent: eventDates.has(iso),
    };
  });
}

type WeekDay = {
  iso: string;
  label: string;
  date: number;
  selected?: boolean;
  hasEvent?: boolean;
};

export type Meeting = {
  id: string;
  time: string;
  date: string;
  clientName: string;
  clientWhatsapp?: string | null;
  status: SessionStatus;
  notificationsOn: boolean;
  meetingUrl?: string | null;
};

type DashboardProps = {
  userName: string;
  sessionsToday: number;
  month: string;
  weekDays: { label: string; date: number; selected?: boolean; hasEvent?: boolean }[];
  nextMeeting: Meeting | null;
  meetings: Meeting[];
  initialEventDates?: string[];
  onSchedule?: () => void;
  onNewClient?: () => void;
  onClients?: () => void;
  onNotifications?: () => void;
  onJoinCall?: (meetingId: string) => void;
  onToggleNotifications?: (meetingId: string, value: boolean) => void;
};

function SectionTitle({ text }: { text: string }) {
  return (
    <h2 className="font-[family-name:var(--typography-heading-h3-font-family)] font-[var(--typography-heading-h3-font-weight,600)] leading-[var(--typography-heading-h3-line-height,28px)] text-[color:var(--content-base,#212121)] text-[length:var(--typography-heading-h3-font-size,20px)] tracking-[var(--typography-heading-h3-letter-spacing,-0.2px)]">
      {text}
    </h2>
  );
}

function QuickActionButton({
  icon,
  label,
  primary = false,
  hasBadge = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  hasBadge?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-[var(--spacing-xs,8px)] shrink-0"
    >
      <div
        className={`relative flex h-[48px] w-[80px] items-center justify-center rounded-[var(--border-radius-lg,16px)] border-solid ${
          primary
            ? "bg-[var(--surface-strongest,#212121)] border-[length:var(--border-width-primary,0.5px)] border-[var(--border-base,#757575)] text-white"
            : "bg-[var(--surface-subtle,#fafafa)] border-[length:var(--border-width-xxs,1px)] border-[var(--border-subtlest,#eee)] text-[color:var(--content-base,#212121)]"
        }`}
      >
        {icon}
        {hasBadge && (
          <span className="absolute -top-[7px] left-[61px] size-[12px] rounded-full bg-red-500" />
        )}
      </div>
      <span className="text-[12px] font-[var(--typography-label-x-small-font-weight,600)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-base,#212121)]">
        {label}
      </span>
    </button>
  );
}

function HeadProfile({
  userName,
  sessionsToday,
}: {
  userName: string;
  sessionsToday: number;
}) {
  return (
    <div className="flex w-full flex-col items-start">
      <h1 className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] leading-[var(--typography-heading-h1-line-height,36px)] text-[color:var(--content-base,#212121)] text-[length:var(--typography-heading-h1-font-size,28px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
        Olá, {userName}
      </h1>
      <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,24px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
        Você tem{" "}
        <span className="text-[color:var(--content-base,#212121)]">
          {sessionsToday} sessões
        </span>{" "}
        agendadas para hoje
      </p>
    </div>
  );
}

function WeekCalendar({
  month,
  weekDays,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  month: string;
  weekDays: WeekDay[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onSelectDay?: (iso: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
      <div className="flex w-full items-center gap-[var(--spacing-xs,8px)] pl-[var(--spacing-xxs,4px)]">
        <p className="flex-1 font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-strongest,#757575)]">
          {month}
        </p>
        <button
          type="button"
          onClick={onPrevWeek}
          className="flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] bg-[var(--surface-base,white)]"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onNextWeek}
          className="flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] bg-[var(--surface-base,white)]"
          aria-label="Próxima semana"
        >
          <ChevronRight size={24} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex w-full items-center justify-between">
        {weekDays.map((day) => (
          <div
            key={day.iso}
            className={`flex flex-col items-center ${
              day.selected ? "gap-[var(--spacing-xs,8px)]" : "gap-[var(--spacing-200,8px)]"
            }`}
          >
            <p
              className={`font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,24px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] ${
                day.selected
                  ? "text-[color:var(--content-base,#212121)]"
                  : "text-[color:var(--content-strongest,#757575)]"
              }`}
            >
              {day.label}
            </p>
            <button
              type="button"
              onClick={() => onSelectDay?.(day.iso)}
              className={`flex w-[40px] flex-col items-center justify-center gap-[var(--spacing-xs,8px)] rounded-[var(--border-radius-lg,16px)] px-[var(--spacing-200,8px)] py-[var(--numbers-padding-xs,8px)] ${
                day.selected ? "bg-[var(--surface-strongest,#212121)]" : ""
              }`}
            >
              <p
                className={`font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-center ${
                  day.selected
                    ? "text-[color:var(--content-subtle,white)]"
                    : "text-[color:var(--content-strongest,#757575)]"
                }`}
              >
                {day.date}
              </p>
              <span
                className={`rounded-[var(--border-radius-lg,16px)] ${
                  day.selected
                    ? "h-[4px] w-[16px] bg-[var(--content-subtle,white)]"
                    : `size-[4px] ${
                        day.hasEvent
                          ? "bg-[var(--content-strongest,#757575)]"
                          : "opacity-0"
                      }`
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NextMeetingCard({
  meeting,
  onJoinCall,
  onOptions,
}: {
  meeting: Meeting;
  onJoinCall?: () => void;
  onOptions?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--next-meeting-gap,16px)] rounded-[var(--next-meeting-border-radius,32px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--next-meeting-border-base,#757575)] border-solid bg-[var(--next-meeting-surface-base,#212121)] p-[var(--next-meeting-padding-large,24px)]">
      <div className="flex w-full items-center gap-[var(--next-meeting-gap,16px)]">
        <div className="flex flex-1 flex-col items-start justify-center text-[color:var(--next-meeting-content-base,#fafafa)]">
          <p className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
            {meeting.time}
          </p>
          <p className="font-[family-name:var(--typography-body-large-font-family)] font-[var(--typography-body-large-font-weight,500)] text-[length:var(--typography-body-large-font-size,18px)] leading-[var(--typography-body-large-line-height,24px)] tracking-[var(--typography-body-large-letter-spacing,-0.2px)]">
            {meeting.clientName}
          </p>
        </div>
        <button
          type="button"
          onClick={onOptions}
          className="flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--border-base,#757575)] border-solid bg-[var(--surface-strongest,#212121)]"
          aria-label="Opções"
        >
          <OptionsIcon size={24} className="text-white" />
        </button>
      </div>
      <a
        href={meeting.meetingUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onJoinCall}
        aria-disabled={!meeting.meetingUrl}
        className={`flex h-[40px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding-small,12px)] text-[color:var(--button-secondary-content-enabled,#212121)] ${
          !meeting.meetingUrl ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <VideoIcon size={24} />
        <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
          Entrar na reunião
        </span>
      </a>
    </div>
  );
}

function MeetingListItem({
  meeting,
  onOptions,
}: {
  meeting: Meeting;
  onOptions?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--next-meeting-gap,16px)] rounded-[var(--next-meeting-border-radius,32px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--next-meeting-border-inverse,#eee)] border-solid bg-[var(--next-meeting-surface-inverse,white)] p-[var(--next-meeting-padding-small,16px)]">
      <div className="flex w-full items-center gap-[var(--next-meeting-gap,16px)]">
        <div className="flex flex-1 items-center gap-[var(--next-meeting-padding-small,16px)]">
          <p className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)] text-[color:var(--next-meeting-content-inverse,#212121)]">
            {meeting.time}
          </p>
          <div className="flex flex-1 flex-col items-start justify-center">
            <p className="w-full truncate font-[family-name:var(--typography-body-large-font-family)] font-[var(--typography-body-large-font-weight,500)] text-[length:var(--typography-body-large-font-size,18px)] leading-[var(--typography-body-large-line-height,24px)] tracking-[var(--typography-body-large-letter-spacing,-0.2px)] text-[color:var(--next-meeting-content-inverse,#212121)]">
              {meeting.clientName}
            </p>
            <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,24px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--meeting-list-item-content-inverse,#212121)]">
              {meeting.notificationsOn ? "Notificações ligadas" : "Notificações desligadas"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[var(--spacing-xs,8px)]">
          {(() => {
            const { bg, text, icon: Icon } = STATUS_CHIP_MAP[meeting.status];
            return (
              <div className={`flex items-center justify-center gap-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-xxs,4px)] ${bg} ${text}`}>
                <Icon size={16} />
              </div>
            );
          })()}
          <button
            type="button"
            onClick={onOptions}
            className="flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-[var(--border-subtlest,#eee)] border-solid bg-[var(--surface-subtle,#fafafa)]"
            aria-label="Opções"
          >
            <OptionsIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  userName,
  sessionsToday: initialSessionsToday,
  month: initialMonth,
  weekDays: initialWeekDaysRaw,
  nextMeeting: initialNextMeeting,
  meetings: initialMeetings,
  initialEventDates,
  onSchedule,
  onNewClient,
  onClients,
  onNotifications,
  onJoinCall,
  onToggleNotifications,
}: DashboardProps) {
  const router = useRouter();
  const todayIso = toISO(new Date());

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set(initialEventDates ?? []));
  const [month, setMonth] = useState(initialMonth);
  const [sessionsToday, setSessionsToday] = useState(initialSessionsToday);
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(initialNextMeeting);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [loading, setLoading] = useState(false);
  const [sheetMeeting, setSheetMeeting] = useState<Meeting | null>(null);

  const weekDays = buildWeekDays(selectedDate, eventDates);

  // A sessão em destaque no card "Próxima sessão" não deve se repetir na
  // lista "Sessões do dia" logo abaixo.
  const isNextMeetingShown = Boolean(nextMeeting) && selectedDate === todayIso;
  const dayMeetings = isNextMeetingShown
    ? meetings.filter((meeting) => meeting.id !== nextMeeting!.id)
    : meetings;

  async function loadDay(dateStr: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar-data?date=${dateStr}`);
      if (!res.ok) return;
      const data = await res.json();
      setEventDates(new Set(data.eventDates as string[]));
      setSessionsToday(data.sessionsToday);
      setMeetings(data.meetings);
      setMonth(MONTH_LABELS[new Date(`${dateStr}T00:00:00`).getMonth()]);
      // "Próxima sessão" fica fixa (não depende do dia selecionado no calendário)
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDay(iso: string) {
    setSelectedDate(iso);
    loadDay(iso);
  }

  function handlePrevWeek() {
    const monday = mondayOf(selectedDate);
    monday.setDate(monday.getDate() - 7);
    const newDate = toISO(monday);
    setSelectedDate(newDate);
    loadDay(newDate);
  }

  function handleNextWeek() {
    const monday = mondayOf(selectedDate);
    monday.setDate(monday.getDate() + 7);
    const newDate = toISO(monday);
    setSelectedDate(newDate);
    loadDay(newDate);
  }

  function handleToggleNotifications(id: string, value: boolean) {
    onToggleNotifications?.(id, value);
    setSheetMeeting((prev) => (prev && prev.id === id ? { ...prev, notificationsOn: value } : prev));
  }

  function handleStatusChange(id: string, status: Meeting["status"]) {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    setNextMeeting((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    setSheetMeeting((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  function handleEdit(id: string) {
    setSheetMeeting(null);
    router.push(`/sessions/${id}/edit`);
  }

  return (
    <>
      <div className="flex w-full flex-col bg-[var(--surface-base,white)]">
        <div className="flex w-full flex-col gap-[var(--spacing-xl,24px)] px-[var(--spacing-md,16px)] pt-[var(--spacing-xl,24px)]">
          <HeadProfile userName={userName} sessionsToday={sessionsToday} />

          <div className="flex w-full items-start justify-between">
            <QuickActionButton icon={<WatchIcon size={24} />} label="Agendar" primary onClick={onSchedule ?? (() => router.push("/sessions/new"))} />
            <QuickActionButton icon={<AddUserIcon size={24} />} label="Novo cliente" onClick={onNewClient ?? (() => router.push("/clients/new"))} />
            <QuickActionButton icon={<PeopleIcon size={24} />} label="Clientes" onClick={onClients ?? (() => router.push("/clients"))} />
            <QuickActionButton
              icon={<EngineIcon size={24} />}
              label="Configurações"
              hasBadge
              onClick={() => router.push("/pricing")}
            />
          </div>

          <div className="h-px w-full bg-[var(--border-subtlest,#eee)]" />
        </div>

        <div className={`flex w-full flex-col gap-[var(--slot-gap-base,24px)] px-[var(--spacing-md,16px)] py-[var(--numbers-padding-xxxs,2px)] transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
          <WeekCalendar
            month={month}
            weekDays={weekDays}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onSelectDay={handleSelectDay}
          />

          {nextMeeting && selectedDate === todayIso && (
            <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
              <SectionTitle text="Próxima sessão" />
              <NextMeetingCard
                meeting={nextMeeting}
                onJoinCall={() => onJoinCall?.(nextMeeting.id)}
                onOptions={() => setSheetMeeting(nextMeeting)}
              />
            </div>
          )}

          <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
            <SectionTitle text="Sessões do dia" />
            <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
              {dayMeetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  meeting={meeting}
                  onOptions={() => setSheetMeeting(meeting)}
                />
              ))}
              {dayMeetings.length === 0 && !isNextMeetingShown && (
                <p className="w-full py-6 text-center text-[14px] text-[color:var(--content-strongest,#757575)]">
                  Nenhuma sessão neste dia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <MeetingDetailsSheet
        meeting={sheetMeeting}
        onClose={() => setSheetMeeting(null)}
        onToggleNotifications={handleToggleNotifications}
        onEdit={handleEdit}
        onJoinCall={onJoinCall}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
