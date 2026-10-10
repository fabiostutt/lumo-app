"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Eye, Pencil, SearchX, VideoOff } from "lucide-react";
import {
  EngineIcon,
  WatchIcon,
  AddUserIcon,
  PeopleIcon,
  OptionsIcon,
  VideoIcon,
  WhatsAppIcon,
  AppXIcon,
  CircleCheckIcon,
  CancelIcon,
} from "@/components/icons";
import MeetingDetailsSheet, { type SessionStatus } from "@/components/MeetingDetailsSheet";
import Disclaimer from "@/components/Disclaimer";
import { useVocabulary } from "@/components/VocabularyProvider";
import { getDashboardSummary } from "@/lib/vocabulary";
import type { ServerDisclaimerTone } from "@/lib/disclaimer";
import FilterMeetingsSheet, { MEETING_FILTER_LABELS, type MeetingFilter } from "@/components/FilterMeetingsSheet";
import { buildWhatsAppReminderUrl } from "@/lib/whatsapp-links";

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
    icon: (props) => <CircleAlert strokeWidth={1.75} {...props} />,
  },
  cancelada: {
    bg: "bg-[var(--feedback-danger-subtlest,#fbe8e8)]",
    text: "text-[color:var(--feedback-danger-strongest,#610d0d)]",
    icon: CancelIcon,
  },
};

// Chip "inverse" (Figma node 59:520) — mesmo mapeamento de tom do
// STATUS_CHIP_MAP acima, mas com fundo/texto invertidos, pra ficar legível
// sobre o fundo escuro do card "Próxima sessão".
const STATUS_LABELS: Record<SessionStatus, string> = {
  confirmada: "Confirmada",
  pendente: "Pendente",
  cancelada: "Cancelada",
};

const STATUS_CHIP_MAP_INVERSE: Record<
  SessionStatus,
  { bg: string; text: string; icon: (props: { size: number; className?: string }) => React.ReactElement }
> = {
  confirmada: {
    bg: "bg-[var(--feedback-success-strongest,#1b6303)]",
    text: "text-[color:var(--feedback-success-subtlest,#efffe5)]",
    icon: CircleCheckIcon,
  },
  pendente: {
    bg: "bg-[var(--feedback-warning-strongest,#706121)]",
    text: "text-[color:var(--feedback-warning-subtlest,#fefbed)]",
    icon: (props) => <CircleAlert strokeWidth={1.75} {...props} />,
  },
  cancelada: {
    bg: "bg-[var(--feedback-danger-strongest,#610d0d)]",
    text: "text-[color:var(--feedback-danger-subtlest,#fbe8e8)]",
    icon: CancelIcon,
  },
};

function NextMeetingStatusChip({ status }: { status: SessionStatus }) {
  const { bg, text, icon: Icon } = STATUS_CHIP_MAP_INVERSE[status];
  return (
    <div className={`flex items-center justify-center gap-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-xxs,4px)] ${bg}`}>
      <Icon size={16} className={text} />
      <span
        className={`font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] whitespace-nowrap ${text}`}
      >
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

// Altura/gap reais dos botões da stack do menu de ações (h-[40px] + gap de
// --components-button-stack-gap-vertical, 8px) — usados aqui só pra estimar
// a altura total do menu e decidir se ele cabe abaixo do botão ⋮.
const ACTIONS_MENU_ITEM_HEIGHT = 40;
const ACTIONS_MENU_GAP = 8;
const ACTIONS_MENU_SCREEN_MARGIN = 16;

function getActionsMenuStyle(anchor: DOMRect, clientWhatsapp?: string | null) {
  const itemCount = 3 + (clientWhatsapp ? 1 : 0);
  const menuHeight = itemCount * ACTIONS_MENU_ITEM_HEIGHT + (itemCount - 1) * ACTIONS_MENU_GAP;
  const right = window.innerWidth - anchor.left + 16;
  const fitsBelow = anchor.top + menuHeight + ACTIONS_MENU_SCREEN_MARGIN <= window.innerHeight;

  return fitsBelow
    ? { top: anchor.top, right }
    : { bottom: window.innerHeight - anchor.bottom, right };
}

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
  durationMinutes: number;
  platform: "whatsapp" | "google";
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
  disclaimerTone: ServerDisclaimerTone | null;
  disclaimerClientCount: number;
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
  const vocab = useVocabulary();
  const summary = getDashboardSummary(sessionsToday, vocab);
  // Destaca só a parte "N {evento}" do resumo, independente de onde ela cai
  // na frase (varia com a contagem: "0 sessões" vs "1 sessão" vs "N sessões").
  const countLabel =
    sessionsToday === 1 ? `1 ${vocab.event(1)}` : `${sessionsToday} ${vocab.event(sessionsToday)}`;
  const [before, after] = summary.split(countLabel);

  return (
    <div className="flex w-full flex-col items-start">
      <h1 className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] leading-[var(--typography-heading-h1-line-height,36px)] text-[color:var(--content-base,#212121)] text-[length:var(--typography-heading-h1-font-size,28px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
        Olá, {userName}.
      </h1>
      <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
        {before !== undefined ? (
          <>
            {before}
            <span className="text-[color:var(--content-base,#212121)]">{countLabel}</span>
            {after}
          </>
        ) : (
          summary
        )}
      </p>
    </div>
  );
}

function WeekCalendar({
  month,
  year,
  weekDays,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: {
  month: string;
  year: number;
  weekDays: WeekDay[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onSelectDay?: (iso: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
      <div className="flex w-full items-center gap-[var(--spacing-xs,8px)] pl-[var(--spacing-xxs,4px)]">
        <div className="flex flex-1 items-center gap-[var(--spacing-xs,8px)] font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)]">
          <p className="text-[color:var(--content-base,#212121)]">{month}</p>
          <p className="text-[color:var(--content-strongest,#757575)]">{year}</p>
        </div>
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
            className="flex flex-col items-center gap-[var(--spacing-sm,12px)]"
          >
            <p
              className={`font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] ${
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

// TODO: /components/icons.tsx precisa de um ícone "mailbox" permanente —
// essa URL é hospedada pelo Figma e expira em ~7 dias.
const MAILBOX_ICON_URL = "https://www.figma.com/api/mcp/asset/58416fac-4489-4ffd-a671-10a4c826218b.svg";

function ScheduleMeetingEmpty({ onSchedule }: { onSchedule?: () => void }) {
  const vocab = useVocabulary();
  return (
    <div className="flex w-full flex-col items-center gap-[var(--sheet-gap-base,16px)] rounded-[var(--sheet-border-radius-base,32px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtle,#bdbdbd)] p-[var(--sheet-padding-base,24px)]">
      <div className="flex w-full flex-col items-center gap-[var(--numbers-padding-xs,8px)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAILBOX_ICON_URL} alt="" className="size-[48px]" />
        <p className="w-full text-center font-[family-name:var(--typography-heading-h3-font-family)] font-[var(--typography-heading-h3-font-weight,600)] text-[length:var(--typography-heading-h3-font-size,20px)] leading-[var(--typography-heading-h3-line-height,28px)] tracking-[var(--typography-heading-h3-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
          Hoje você está com o dia livre
        </p>
        <p className="w-full text-center font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-strongest,#757575)]">
          Aproveite para tomar um café e organize tua semana por aqui.
        </p>
      </div>
      <button
        type="button"
        onClick={onSchedule}
        className="flex h-[40px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding-small,12px)]"
      >
        <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-primary-content-enabled,#fafafa)]">
          Agendar {vocab.event(1)}
        </span>
      </button>
    </div>
  );
}

function NoOtherMeetingsDisclaimer() {
  const vocab = useVocabulary();
  return (
    <div className="flex w-full items-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
      <VideoOff size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-base,#212121)]" />
      <div className="flex flex-1 flex-col items-start">
        <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
          Não há mais {vocab.event(2)} hoje
        </p>
        <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
          Você pode agendar uma nova {vocab.event(1)}{" "}
          <Link href="/sessions/new" className="underline">
            aqui
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function NoFilterResultsDisclaimer() {
  const vocab = useVocabulary();
  return (
    <div className="flex w-full items-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
      <SearchX size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-base,#212121)]" />
      <div className="flex flex-1 flex-col items-start">
        <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
          Nenhum resultado para este filtro
        </p>
        <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
          Selecione outro filtro para ver {vocab.event(2)} disponíveis.
        </p>
      </div>
    </div>
  );
}

function NextMeetingCard({
  meeting,
  onJoinCall,
  onOptions,
  onViewDetails,
  isMenuOpen,
}: {
  meeting: Meeting;
  onJoinCall?: () => void;
  onOptions?: (anchor: DOMRect) => void;
  onViewDetails?: () => void;
  isMenuOpen?: boolean;
}) {
  const isGoogle = meeting.platform === "google";
  const vocab = useVocabulary();
  return (
    <div
      onClick={onViewDetails}
      className="flex w-full cursor-pointer flex-col gap-[var(--next-meeting-gap,16px)] rounded-[var(--next-meeting-border-radius,32px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--next-meeting-border-base,#757575)] border-solid bg-[var(--next-meeting-surface-base,#212121)] p-[var(--next-meeting-padding-large,24px)]"
    >
      <div className="flex w-full items-start gap-[var(--next-meeting-gap,16px)]">
        <div className="flex flex-1 flex-col items-start gap-[var(--semantic-spacing-xxs,8px)]">
          <div className="flex flex-col items-start text-[color:var(--next-meeting-content-base,#fafafa)]">
            <p className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
              {meeting.time}
            </p>
            <p className="font-[family-name:var(--typography-body-large-font-family)] font-[var(--typography-body-large-font-weight,500)] text-[length:var(--typography-body-large-font-size,18px)] leading-[var(--typography-body-large-line-height,24px)] tracking-[var(--typography-body-large-letter-spacing,-0.2px)]">
              {meeting.clientName}
            </p>
          </div>
          <div className="flex items-center gap-[var(--spacing-xs,8px)]">
            <Calendar size={16} strokeWidth={1.75} className="shrink-0 text-[color:var(--next-meeting-content-subtle,#9e9e9e)]" />
            <p className="font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] text-[color:var(--next-meeting-content-subtle,#9e9e9e)]">
              {formatShortDate(meeting.date)}
            </p>
            <NextMeetingStatusChip status={meeting.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOptions?.(e.currentTarget.getBoundingClientRect());
          }}
          className={`flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--border-base,#757575)] border-solid bg-[var(--surface-strongest,#212121)] ${
            isMenuOpen ? "relative z-50" : ""
          }`}
          aria-label="Opções"
        >
          <OptionsIcon size={24} className="text-white" />
        </button>
      </div>
      <a
        href={meeting.meetingUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          onJoinCall?.();
        }}
        aria-disabled={!meeting.meetingUrl}
        className={`flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding,16px)] text-[color:var(--button-secondary-content-enabled,#212121)] ${
          !meeting.meetingUrl ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {isGoogle ? <VideoIcon size={24} /> : <WhatsAppIcon size={24} />}
        <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
          {isGoogle ? `Entrar na ${vocab.event(1)}` : "Abrir no WhatsApp"}
        </span>
      </a>
    </div>
  );
}

function MeetingListItem({
  meeting,
  onOptions,
  isMenuOpen,
}: {
  meeting: Meeting;
  onOptions?: (anchor: DOMRect) => void;
  isMenuOpen?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--next-meeting-gap,16px)] rounded-[var(--next-meeting-border-radius,32px)] border-[length:var(--border-width-primary,0.5px)] border-[var(--next-meeting-border-strongest,#eee)] border-solid bg-[var(--next-meeting-surface-strongest,white)] p-[var(--next-meeting-padding-small,16px)]">
      <div className="flex w-full items-center gap-[var(--next-meeting-gap,16px)]">
        <div className="flex flex-1 items-center gap-[var(--next-meeting-padding-small,16px)]">
          <p className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)] text-[color:var(--next-meeting-content-strongest,#212121)]">
            {meeting.time}
          </p>
          <div className="flex flex-1 flex-col items-start justify-center">
            <p className="w-full truncate font-[family-name:var(--typography-body-large-font-family)] font-[var(--typography-body-large-font-weight,500)] text-[length:var(--typography-body-large-font-size,18px)] leading-[var(--typography-body-large-line-height,24px)] tracking-[var(--typography-body-large-letter-spacing,-0.2px)] text-[color:var(--next-meeting-content-strongest,#212121)]">
              {meeting.clientName}
            </p>
            <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--meeting-list-item-content-inverse,#212121)]">
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
            onClick={(e) => {
              e.stopPropagation();
              onOptions?.(e.currentTarget.getBoundingClientRect());
            }}
            className={`flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] bg-[var(--surface-base,white)] ${
              isMenuOpen ? "relative z-50" : ""
            }`}
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
  disclaimerTone,
  disclaimerClientCount,
  onSchedule,
  onNewClient,
  onClients,
  onNotifications,
  onJoinCall,
  onToggleNotifications,
}: DashboardProps) {
  const router = useRouter();
  const vocab = useVocabulary();
  const todayIso = toISO(new Date());

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set(initialEventDates ?? []));
  const [month, setMonth] = useState(initialMonth);
  const [sessionsToday, setSessionsToday] = useState(initialSessionsToday);
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(initialNextMeeting);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [loading, setLoading] = useState(false);
  const [sheetMeeting, setSheetMeeting] = useState<Meeting | null>(null);
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [actionsMenu, setActionsMenu] = useState<{ meeting: Meeting; anchor: DOMRect } | null>(null);

  const weekDays = buildWeekDays(selectedDate, eventDates);
  const year = new Date(`${selectedDate}T00:00:00`).getFullYear();

  // A sessão em destaque no card "Próxima sessão" não deve se repetir na
  // lista "Sessões do dia" logo abaixo.
  const isNextMeetingShown = Boolean(nextMeeting) && selectedDate === todayIso;
  const dayMeetings = isNextMeetingShown
    ? meetings.filter((meeting) => meeting.id !== nextMeeting!.id)
    : meetings;

  // "Concluída" não é um status salvo — é uma sessão cujo horário final
  // (início + duração) já passou. Uma vez concluída, ela some dos filtros de
  // "Confirmadas"/"Pendentes" (só aparece em "Concluídas"/"Todas");
  // "Canceladas" fica de fora dessa reclassificação, já que uma sessão
  // cancelada nunca chega a ser "concluída".
  function isMeetingCompleted(meeting: Meeting) {
    if (meeting.status === "cancelada") return false;
    const start = new Date(`${meeting.date}T${meeting.time}:00`);
    const end = new Date(start.getTime() + meeting.durationMinutes * 60 * 1000);
    return end < new Date();
  }

  const filteredDayMeetings = dayMeetings.filter((meeting) => {
    const completed = isMeetingCompleted(meeting);
    if (meetingFilter === "all") return true;
    if (meetingFilter === "upcoming") return !completed;
    if (meetingFilter === "completed") return completed;
    if (completed) return false;
    return meeting.status === meetingFilter;
  });

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
        <div className="flex w-full flex-col gap-[var(--semantic-spacing-md,16px)] px-[var(--spacing-md,16px)] pt-[var(--spacing-xl,24px)]">
          <HeadProfile userName={userName} sessionsToday={sessionsToday} />

          <Disclaimer serverTone={disclaimerTone} clientCount={disclaimerClientCount} />

          <div className="flex w-full items-start justify-between">
            <QuickActionButton icon={<WatchIcon size={24} />} label="Agendar" primary onClick={onSchedule ?? (() => router.push("/sessions/new"))} />
            <QuickActionButton icon={<AddUserIcon size={24} />} label={`Novo ${vocab.person(1)}`} onClick={onNewClient ?? (() => router.push("/clients/new"))} />
            <QuickActionButton icon={<PeopleIcon size={24} />} label={vocab.Person(2)} onClick={onClients ?? (() => router.push("/clients"))} />
            <QuickActionButton
              icon={<EngineIcon size={24} />}
              label="Ajustes"
              hasBadge
              onClick={() => router.push("/profile")}
            />
          </div>

          <div className="h-px w-full bg-[var(--border-subtlest,#eee)]" />
        </div>

        <div className={`flex w-full flex-col gap-[var(--slot-gap-base,24px)] px-[var(--spacing-md,16px)] pb-[var(--spacing-md,16px)] transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
          <WeekCalendar
            month={month}
            year={year}
            weekDays={weekDays}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onSelectDay={handleSelectDay}
          />

          {nextMeeting && selectedDate === todayIso && (
            <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
              <SectionTitle text={`Próxima ${vocab.event(1)}`} />
              <NextMeetingCard
                meeting={nextMeeting}
                onJoinCall={() => onJoinCall?.(nextMeeting.id)}
                onViewDetails={() => setSheetMeeting(nextMeeting)}
                onOptions={(anchor) =>
                  setActionsMenu((prev) =>
                    prev?.meeting.id === nextMeeting.id ? null : { meeting: nextMeeting, anchor }
                  )
                }
                isMenuOpen={actionsMenu?.meeting.id === nextMeeting.id}
              />
            </div>
          )}

          <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
            <div className="flex w-full items-center justify-between">
              <SectionTitle text={`${vocab.Event(2)} do dia`} />
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="flex items-center gap-[var(--spacing-xs,8px)]"
              >
                <span className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-strongest,#757575)]">
                  {MEETING_FILTER_LABELS[meetingFilter]}
                </span>
                <ChevronDown size={24} strokeWidth={1.75} className="text-[color:var(--content-strongest,#757575)]" />
              </button>
            </div>
            <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
              {filteredDayMeetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  meeting={meeting}
                  onOptions={(anchor) =>
                    setActionsMenu((prev) => (prev?.meeting.id === meeting.id ? null : { meeting, anchor }))
                  }
                  isMenuOpen={actionsMenu?.meeting.id === meeting.id}
                />
              ))}
              {dayMeetings.length === 0 && !isNextMeetingShown && (
                <ScheduleMeetingEmpty onSchedule={onSchedule ?? (() => router.push("/sessions/new"))} />
              )}
              {dayMeetings.length === 0 && isNextMeetingShown && <NoOtherMeetingsDisclaimer />}
              {dayMeetings.length > 0 && filteredDayMeetings.length === 0 && <NoFilterResultsDisclaimer />}
            </div>
          </div>

          <FilterMeetingsSheet
            open={filterSheetOpen}
            selected={meetingFilter}
            onClose={() => setFilterSheetOpen(false)}
            onSelect={(filter) => {
              setMeetingFilter(filter);
              setFilterSheetOpen(false);
            }}
          />
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

      {actionsMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--overlay-base,#212121cc)] backdrop-blur-[4px]"
            onClick={() => setActionsMenu(null)}
          />
          <div
            className="fixed z-50 flex flex-col items-end gap-[var(--components-button-stack-gap-vertical,8px)]"
            style={getActionsMenuStyle(actionsMenu.anchor, actionsMenu.meeting.clientWhatsapp)}
          >
            <button
              type="button"
              onClick={() => {
                setSheetMeeting(actionsMenu.meeting);
                setActionsMenu(null);
              }}
              className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] whitespace-nowrap rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding-small,12px)] text-[color:var(--button-tertiary-content-enabled,#212121)]"
            >
              <Eye size={24} strokeWidth={1.75} />
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
                Ver detalhes
              </span>
            </button>
            {actionsMenu.meeting.clientWhatsapp && (
              <a
                href={buildWhatsAppReminderUrl(actionsMenu.meeting.clientWhatsapp, actionsMenu.meeting.clientName, actionsMenu.meeting.time)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActionsMenu(null)}
                className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] whitespace-nowrap rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding-small,12px)] text-[color:var(--button-tertiary-content-enabled,#212121)]"
              >
                <WhatsAppIcon size={24} />
                <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
                  Enviar notificação
                </span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                const id = actionsMenu.meeting.id;
                setActionsMenu(null);
                handleEdit(id);
              }}
              className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] whitespace-nowrap rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding-small,12px)] text-[color:var(--button-secondary-content-enabled,#212121)]"
            >
              <Pencil size={24} strokeWidth={1.75} />
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
                Editar sessão
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActionsMenu(null)}
              className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] whitespace-nowrap rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding-small,12px)] text-[color:var(--button-secondary-content-enabled,#212121)]"
            >
              <AppXIcon size={24} />
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)]">
                Fechar
              </span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
