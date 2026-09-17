"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Clock,
  UserPlus,
  User,
  Bell,
  MoreVertical,
  Video,
  Check,
} from "lucide-react";
import MeetingDetailsSheet, { type SessionStatus } from "@/components/MeetingDetailsSheet";

type WeekDay = {
  label: string;
  date: number;
  selected?: boolean;
  hasEvent?: boolean;
};

export type Meeting = {
  id: string;
  time: string;
  date: string; // ISO "yyyy-mm-dd"
  clientName: string;
  status: SessionStatus;
  notificationsOn: boolean;
  meetingUrl?: string | null;
};

type DashboardProps = {
  userName: string;
  sessionsToday: number;
  month: string;
  weekDays: WeekDay[];
  nextMeeting: Meeting | null;
  meetings: Meeting[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onSchedule?: () => void;
  onNewClient?: () => void;
  onClients?: () => void;
  onNotifications?: () => void;
  onJoinCall?: (meetingId: string) => void;
  onToggleNotifications?: (meetingId: string, value: boolean) => void;
  onMarkCompleted?: (meetingId: string) => void;
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
  onSettings,
}: {
  userName: string;
  sessionsToday: number;
  onSettings?: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-sm,12px)]">
      <div className="flex flex-1 flex-col items-start">
        <h1 className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] leading-[var(--typography-heading-h1-line-height,36px)] text-[color:var(--content-base,#212121)] text-[length:var(--typography-heading-h1-font-size,28px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
          Olá, {userName}
        </h1>
        <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
          Você tem{" "}
          <span className="text-[color:var(--content-base,#212121)]">
            {sessionsToday} sessões
          </span>{" "}
          agendadas para hoje
        </p>
      </div>
      <button
        type="button"
        onClick={onSettings}
        className="flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] bg-[var(--surface-base,white)]"
        aria-label="Configurações"
      >
        <Settings size={24} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function WeekCalendar({
  month,
  weekDays,
  onPrevWeek,
  onNextWeek,
}: {
  month: string;
  weekDays: WeekDay[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
      <div className="flex w-full items-center gap-[var(--spacing-xs,8px)] pl-[var(--spacing-xxs,4px)]">
        <p className="flex-1 text-[16px] font-[var(--typography-label-small-font-weight,600)] leading-[24px] text-[color:var(--content-strongest,#757575)]">
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
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-[var(--spacing-xs,8px)]">
            <p
              className={`text-[14px] leading-[24px] tracking-[-0.2px] ${
                day.selected
                  ? "text-[color:var(--content-base,#212121)]"
                  : "text-[color:var(--content-strongest,#757575)]"
              }`}
            >
              {day.label}
            </p>
            <div
              className={`flex w-[40px] flex-col items-center justify-center gap-[var(--spacing-xs,8px)] rounded-[var(--border-radius-lg,16px)] px-[var(--spacing-200,8px)] py-[var(--numbers-padding-xs,8px)] ${
                day.selected ? "bg-[var(--surface-strongest,#212121)]" : ""
              }`}
            >
              <p
                className={`text-[16px] font-[var(--typography-label-small-font-weight,600)] leading-[24px] ${
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
            </div>
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
          <p className="text-[28px] font-[var(--typography-heading-h1-font-weight,600)] leading-[36px] tracking-[-0.4px]">
            {meeting.time}
          </p>
          <p className="text-[18px] font-[var(--typography-body-large-font-weight,500)] leading-[24px] tracking-[-0.2px]">
            {meeting.clientName}
          </p>
        </div>
        <button
          type="button"
          onClick={onOptions}
          className="flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--border-base,#757575)] border-solid bg-[var(--surface-strongest,#212121)]"
          aria-label="Opções"
        >
          <MoreVertical size={24} strokeWidth={1.75} className="text-white" />
        </button>
      </div>
      <button
        type="button"
        onClick={onJoinCall}
        className="flex h-[40px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding-small,12px)] text-[color:var(--button-secondary-content-enabled,#212121)]"
      >
        <Video size={24} strokeWidth={1.75} />
        <span className="text-[18px] font-[var(--typography-label-medium-font-weight,600)] leading-[24px]">
          Entrar na chamada
        </span>
      </button>
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
    <div className="flex w-full flex-col gap-[var(--next-meeting-gap,16px)] rounded-[var(--next-meeting-border-radius,32px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--next-meeting-border-inverse,#eee)] border-solid bg-[var(--next-meeting-surface-inverse,#fafafa)] p-[var(--next-meeting-padding-small,16px)]">
      <div className="flex w-full items-center gap-[var(--next-meeting-gap,16px)]">
        <div className="flex flex-1 items-center gap-[var(--next-meeting-padding-small,16px)]">
          <p className="text-[28px] font-[var(--typography-heading-h1-font-weight,600)] leading-[36px] tracking-[-0.4px] text-[color:var(--next-meeting-content-inverse,#212121)]">
            {meeting.time}
          </p>
          <div className="flex flex-1 flex-col items-start justify-center">
            <p className="w-full truncate text-[18px] font-[var(--typography-body-large-font-weight,500)] leading-[24px] tracking-[-0.2px] text-[color:var(--next-meeting-content-inverse,#212121)]">
              {meeting.clientName}
            </p>
            <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--meeting-list-item-content-inverse,#212121)]">
              {meeting.notificationsOn ? "Notificações ligadas" : "Notificações desligadas"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[var(--spacing-xs,8px)]">
          {meeting.status === "confirmada" && (
            <div className="flex items-center justify-center gap-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-lg,16px)] bg-[var(--feedback-success-subtlest,#efffe5)] p-[var(--spacing-xxs,4px)] text-green-700">
              <Check size={16} strokeWidth={2} />
            </div>
          )}
          <button
            type="button"
            onClick={onOptions}
            className="flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-[var(--border-subtlest,#eee)] border-solid bg-[var(--surface-subtle,#fafafa)]"
            aria-label="Opções"
          >
            <MoreVertical size={24} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  userName,
  sessionsToday,
  month,
  weekDays,
  nextMeeting,
  meetings,
  onPrevWeek,
  onNextWeek,
  onSchedule,
  onNewClient,
  onClients,
  onNotifications,
  onJoinCall,
  onToggleNotifications,
  onMarkCompleted,
}: DashboardProps) {
  const router = useRouter();
  const [sheetMeeting, setSheetMeeting] = useState<Meeting | null>(null);

  function handleToggleNotifications(id: string, value: boolean) {
    onToggleNotifications?.(id, value);
    setSheetMeeting((prev) => (prev && prev.id === id ? { ...prev, notificationsOn: value } : prev));
  }

  return (
    <>
      <div className="flex w-full flex-col bg-[var(--surface-base,white)]">
        <div className="flex w-full flex-col gap-[var(--spacing-xl,24px)] px-[var(--spacing-md,16px)] pt-[var(--spacing-xl,24px)]">
          <HeadProfile userName={userName} sessionsToday={sessionsToday} onSettings={onNotifications ? undefined : undefined} />

          <div className="flex w-full items-start justify-between">
            <QuickActionButton icon={<Clock size={24} strokeWidth={1.75} />} label="Agendar" primary onClick={onSchedule ?? (() => router.push("/sessions/new"))} />
            <QuickActionButton icon={<UserPlus size={24} strokeWidth={1.75} />} label="Novo cliente" onClick={onNewClient ?? (() => router.push("/clients/new"))} />
            <QuickActionButton icon={<User size={24} strokeWidth={1.75} />} label="Clientes" onClick={onClients ?? (() => router.push("/clients"))} />
            <QuickActionButton
              icon={<Bell size={24} strokeWidth={1.75} />}
              label="Notificações"
              hasBadge
              onClick={onNotifications}
            />
          </div>

          <div className="h-px w-full bg-[var(--border-subtlest,#eee)]" />
        </div>

        <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] px-[var(--spacing-md,16px)] py-[var(--numbers-padding-xxxs,2px)]">
          <WeekCalendar
            month={month}
            weekDays={weekDays}
            onPrevWeek={onPrevWeek}
            onNextWeek={onNextWeek}
          />

          {nextMeeting && (
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
              {meetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  meeting={meeting}
                  onOptions={() => setSheetMeeting(meeting)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <MeetingDetailsSheet
        meeting={sheetMeeting}
        onClose={() => setSheetMeeting(null)}
        onToggleNotifications={handleToggleNotifications}
        onMarkCompleted={onMarkCompleted}
        onJoinCall={onJoinCall}
      />
    </>
  );
}
