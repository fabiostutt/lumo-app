"use client";

import { useEffect } from "react";
import { X, MessageCircle, Video, Check, Share2 } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";

export type SessionStatus = "pendente" | "confirmada" | "cancelada";

export type MeetingDetails = {
  id: string;
  time: string;
  date: string;
  clientName: string;
  clientWhatsapp?: string | null;
  status: SessionStatus;
  notificationsOn: boolean;
  meetingUrl?: string | null;
};

function buildWhatsAppShareUrl(whatsapp: string, clientName: string, meetingUrl: string, time: string) {
  const digits = whatsapp.replace(/\D/g, "");
  const to = digits.startsWith("55") ? digits : `55${digits}`;
  const text = `Olá, ${clientName}! Aqui está o link da nossa sessão de hoje às ${time}: ${meetingUrl}`;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

type MeetingDetailsSheetProps = {
  meeting: MeetingDetails | null;
  onClose: () => void;
  onToggleNotifications?: (id: string, value: boolean) => void;
  onEdit?: (id: string) => void;
  onJoinCall?: (id: string) => void;
  onStatusChange?: (id: string, status: SessionStatus) => void;
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
      <span
        className={`font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] ${s.text}`}
      >
        {s.label}
      </span>
    </div>
  );
}

export default function MeetingDetailsSheet({
  meeting,
  onClose,
  onToggleNotifications,
  onEdit,
  onJoinCall,
  onStatusChange,
}: MeetingDetailsSheetProps) {
  const isFilled = !!meeting?.meetingUrl;
  const meetingId = meeting?.id;
  const meetingStatus = meeting?.status;

  useEffect(() => {
    if (!meetingId || meetingStatus !== "pendente") return;

    fetch(`/api/sessions/${meetingId}/sync-status`, { method: "POST" })
      .then((res) => res.json())
      .then((data: { status?: SessionStatus | null }) => {
        if (data.status && data.status !== meetingStatus) {
          onStatusChange?.(meetingId, data.status);
        }
      })
      .catch(() => {
        // Falha silenciosa — o status só fica desatualizado até a próxima abertura.
      });
    // Só queremos disparar isso quando o sheet abre com uma sessão pendente
    // diferente, não a cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  return (
    <BottomSheet open={!!meeting} onClose={onClose}>
      {meeting && (
        <>
          <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
            <div className="flex flex-1 flex-col items-start justify-end gap-[var(--spacing-xxs,4px)]">
              <div className="flex flex-col items-start">
                <p className="font-[family-name:var(--typography-heading-h2-font-family)] font-[var(--typography-heading-h2-font-weight,600)] text-[length:var(--typography-heading-h2-font-size,24px)] leading-[var(--typography-heading-h2-line-height,32px)] tracking-[var(--typography-heading-h2-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
                  {meeting.time}
                </p>
                <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-strongest,#757575)]">
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
            <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--input-default-label,#212121)]">
              Link da sessão
            </p>
            <div
              className={`flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)] ${
                isFilled
                  ? "border-[var(--input-filled-border-default,#757575)]"
                  : "border-[var(--input-default-border-default,#bdbdbd)]"
              }`}
            >
              <MessageCircle
                size={24}
                strokeWidth={1.75}
                className="shrink-0 text-[color:var(--content-strongest,#757575)]"
              />
              <p
                className={`flex-[1_0_0] truncate font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] ${
                  isFilled
                    ? "text-[color:var(--input-filled-content-value,#212121)]"
                    : "text-[color:var(--input-default-content-placeholder,#757575)]"
                }`}
              >
                {meeting.meetingUrl || "O link aparecerá aqui"}
              </p>
            </div>
          </div>

          {meeting.meetingUrl && meeting.clientWhatsapp && (
            <a
              href={buildWhatsAppShareUrl(
                meeting.clientWhatsapp,
                meeting.clientName,
                meeting.meetingUrl,
                meeting.time
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] px-[var(--button-padding,16px)]"
            >
              <Share2 size={20} strokeWidth={1.75} className="text-[color:var(--content-base,#212121)]" />
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
                Compartilhar por WhatsApp
              </span>
            </a>
          )}

          <div className="flex w-full flex-col items-start rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-lg,16px)]">
            <div className="flex w-full items-center gap-[var(--spacing-md,16px)]">
              <div className="flex flex-1 flex-col items-start">
                <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--action-secondary-strongest,#212121)]">
                  Notificações e lembretes
                </p>
                <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,24px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
                  Ativar alertas e confirmações
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={meeting.notificationsOn}
                onClick={() => onToggleNotifications?.(meeting.id, !meeting.notificationsOn)}
                className={`flex shrink-0 flex-col items-center rounded-[var(--border-radius-10,10px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-base,#757575)] px-[var(--spacing-xxxs,2px)] transition-all ${
                  meeting.notificationsOn
                    ? "bg-[var(--surface-strongest,#212121)] pt-[var(--spacing-xxxs,2px)] pb-[var(--spacing-md,16px)]"
                    : "bg-[var(--surface-base,white)] pt-[var(--spacing-md,16px)] pb-[var(--spacing-xxxs,2px)]"
                }`}
              >
                <span
                  className={`size-[24px] rounded-[var(--border-radius-8,8px)] ${
                    meeting.notificationsOn
                      ? "bg-[var(--content-subtle,white)]"
                      : "bg-[var(--content-base,#212121)]"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
            <button
              type="button"
              onClick={() => onEdit?.(meeting.id)}
              className="flex h-[40px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding-small,12px)]"
            >
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-tertiary-content-enabled,#212121)]">
                Editar sessão
              </span>
            </button>
            <button
              type="button"
              onClick={() => onJoinCall?.(meeting.id)}
              className="flex h-[40px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding-small,12px)]"
            >
              <Video
                size={24}
                strokeWidth={1.75}
                className="text-[color:var(--button-primary-content-enabled,#fafafa)]"
              />
              <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-primary-content-enabled,#fafafa)]">
                Iniciar sessão
              </span>
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
