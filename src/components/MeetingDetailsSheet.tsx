"use client";

import { X, MessageCircle, Video, Check } from "lucide-react";

export type SessionStatus = "pendente" | "confirmada" | "cancelada";

export type MeetingDetails = {
  id: string;
  time: string;
  date: string; // ISO "yyyy-mm-dd"
  clientName: string;
  status: SessionStatus;
  notificationsOn: boolean;
  meetingUrl?: string | null;
};

type MeetingDetailsSheetProps = {
  meeting: MeetingDetails | null;
  onClose: () => void;
  onToggleNotifications?: (id: string, value: boolean) => void;
  onMarkCompleted?: (id: string) => void;
  onJoinCall?: (id: string) => void;
};

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm} • ${WEEKDAYS[d.getDay()]}`;
}

function StatusChip({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { bg: string; text: string; label: string }> = {
    confirmada: {
      bg: "bg-[var(--feedback-success-subtlest,#efffe5)]",
      text: "text-[var(--feedback-success-strongest,#1b6303)]",
      label: "Confirmada",
    },
    pendente: { bg: "bg-[#f5f5f5]", text: "text-[#757575]", label: "Pendente" },
    cancelada: { bg: "bg-[#ffece5]", text: "text-[#b3261e]", label: "Cancelada" },
  };
  const s = map[status];
  return (
    <div
      className={`flex items-center justify-center gap-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-xxs,4px)] ${s.bg}`}
    >
      {status === "confirmada" && <Check size={16} strokeWidth={2} className={s.text} />}
      <span className={`text-[12px] font-semibold leading-[16px] tracking-[0.4px] ${s.text}`}>
        {s.label}
      </span>
    </div>
  );
}

export default function MeetingDetailsSheet({
  meeting,
  onClose,
  onToggleNotifications,
  onMarkCompleted,
  onJoinCall,
}: MeetingDetailsSheetProps) {
  const open = !!meeting;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-[#212121]/60 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative mx-4 mb-10 w-full max-w-[398px] rounded-[var(--border-radius-lg,16px)] bg-[var(--surface-base,white)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-[120%]"
        }`}
      >
        {meeting && (
          <div className="flex flex-col gap-[var(--sheet-gap,16px)] p-[var(--sheet-padding,16px)] pb-[max(16px,env(safe-area-inset-bottom))]">
            <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
              <div className="flex flex-1 flex-col items-start justify-end gap-[var(--spacing-xxs,4px)]">
                <div className="flex flex-col items-start">
                  <p className="text-[24px] font-semibold leading-[32px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
                    {meeting.time}
                  </p>
                  <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-strongest,#757575)]">
                    {formatDateLabel(meeting.date)}
                  </p>
                </div>
                <StatusChip status={meeting.status} />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-[24px] items-center justify-center text-[color:var(--content-base,#212121)]"
                aria-label="Fechar"
              >
                <X size={24} strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
              <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
                Link da sessão
              </p>
              <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-filled-border-default,#757575)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
                <MessageCircle
                  size={24}
                  strokeWidth={1.75}
                  className="shrink-0 text-[color:var(--content-strongest,#757575)]"
                />
                <p className="flex-1 truncate text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
                  {meeting.meetingUrl || "O link aparecerá aqui"}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col items-start rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-lg,16px)]">
              <div className="flex w-full items-center gap-[var(--spacing-md,16px)]">
                <div className="flex flex-1 flex-col items-start gap-[var(--spacing-xxxs,2px)]">
                  <p className="w-full text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
                    Notificações e lembretes
                  </p>
                  <p className="w-full text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
                    Ativar alertas e confirmações de sessão
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={meeting.notificationsOn}
                  onClick={() => onToggleNotifications?.(meeting.id, !meeting.notificationsOn)}
                  className={`flex h-[28px] w-[48px] shrink-0 items-center rounded-full border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-base,#757575)] p-[2px] transition-colors ${
                    meeting.notificationsOn
                      ? "justify-end bg-[var(--surface-strongest,#212121)]"
                      : "justify-start bg-[#e5e5e5]"
                  }`}
                >
                  <span className="size-[22px] rounded-full bg-white" />
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
              <button
                type="button"
                onClick={() => onMarkCompleted?.(meeting.id)}
                className="flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding,16px)]"
              >
                <span className="text-[18px] font-semibold leading-[24px] text-[color:var(--button-tertiary-content-enabled,#212121)]">
                  Marcar como concluída
                </span>
              </button>
              <button
                type="button"
                onClick={() => onJoinCall?.(meeting.id)}
                className="flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--numbers-padding-md,16px)]"
              >
                <Video size={24} strokeWidth={1.75} className="text-[color:var(--button-primary-content-enabled,#fafafa)]" />
                <span className="text-[18px] font-semibold leading-[24px] text-[color:var(--button-primary-content-enabled,#fafafa)]">
                  Iniciar sessão
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
