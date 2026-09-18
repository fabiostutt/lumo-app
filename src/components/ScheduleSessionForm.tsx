"use client";

import { useMemo, useState } from "react";
import { User, ChevronRight, Calendar, Clock as ClockIcon, MessageCircle } from "lucide-react";
import { createSessionAction } from "@/lib/actions/create-session";
import { updateSessionAction } from "@/lib/actions/update-session";
import ClientPickerSheet from "@/components/ClientPickerSheet";
import SegmentedToggle from "@/components/SegmentedToggle";
import TextField from "@/components/TextField";

type ClientOption = { id: string; name: string; whatsapp: string | null };

type ScheduleSessionFormProps = {
  clients: ClientOption[];
  initialClientId?: string;
  sessionId?: string;
  initialDate?: string;
  initialTime?: string;
  initialNotificationsOn?: boolean;
  initialMeetingLink?: string | null;
};

export default function ScheduleSessionForm({
  clients,
  initialClientId,
  sessionId,
  initialDate,
  initialTime,
  initialNotificationsOn,
  initialMeetingLink,
}: ScheduleSessionFormProps) {
  const isEditing = !!sessionId;

  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState(initialTime ?? "");
  const [platform, setPlatform] = useState<"whatsapp" | "google">("whatsapp");
  const [notificationsOn, setNotificationsOn] = useState(initialNotificationsOn ?? true);
  const [copied, setCopied] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  const computedLink = useMemo(() => {
    if (platform === "whatsapp" && selectedClient?.whatsapp) {
      const digits = selectedClient.whatsapp.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : "";
    }
    return "";
  }, [platform, selectedClient]);

  const meetingLink = isEditing && initialMeetingLink ? initialMeetingLink : computedLink;

  const isValid = !!clientId && !!date && !!time;

  async function handleCopy() {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — ignora
    }
  }

  return (
    <form
      action={isEditing ? updateSessionAction : createSessionAction}
      className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]"
    >
      {isEditing && <input type="hidden" name="sessionId" value={sessionId} />}
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="meetingLink" value={meetingLink} />
      <input type="hidden" name="notificationsEnabled" value={String(notificationsOn)} />

      <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
        <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
          Adicionar participante
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={`flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)] ${
            selectedClient
              ? "border-[var(--input-filled-border-default,#757575)]"
              : "border-[var(--input-default-border-default,#bdbdbd)]"
          }`}
        >
          <User size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
          <span
            className={`flex-1 text-left font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] ${
              selectedClient
                ? "text-[color:var(--input-filled-content-value,#212121)]"
                : "text-[color:var(--input-default-content-placeholder,#757575)]"
            }`}
          >
            {selectedClient ? selectedClient.name : "Selecionar"}
          </span>
          <ChevronRight size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
        </button>
      </div>

      <div className="flex w-full gap-[var(--stacks-gap-horizontal,16px)]">
        <div className="min-w-0 flex-1">
          <TextField
            label="Data"
            name="date"
            type="date"
            placeholder=""
            icon={<Calendar size={24} strokeWidth={1.75} />}
            value={date}
            onChange={setDate}
          />
        </div>
        <div className="min-w-0 flex-1">
          <TextField
            label="Hora"
            name="time"
            type="time"
            placeholder=""
            icon={<ClockIcon size={24} strokeWidth={1.75} />}
            value={time}
            onChange={setTime}
          />
        </div>
      </div>

      <SegmentedToggle
        label="Plataforma"
        value={platform}
        onChange={setPlatform}
        options={[
          { value: "whatsapp", label: "WhatsApp" },
          { value: "google", label: "Google" },
        ]}
      />

      <div className="flex w-full items-end gap-[var(--spacing-xs,8px)]">
        <div className="flex flex-1 flex-col gap-[var(--input-gap,4px)]">
          <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
            Link da sessão
          </p>
          <div
            className={`flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)] ${
              meetingLink
                ? "border-[var(--input-filled-border-default,#757575)]"
                : "border-[var(--input-default-border-default,#bdbdbd)]"
            }`}
          >
            <MessageCircle size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
            <p
              className={`flex-1 truncate font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] ${
                meetingLink
                  ? "text-[color:var(--input-filled-content-value,#212121)]"
                  : "text-[color:var(--input-default-content-placeholder,#757575)]"
              }`}
            >
              {meetingLink || "O link aparecerá aqui"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!meetingLink}
          className={`flex h-[48px] shrink-0 items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] px-[var(--numbers-padding-md,16px)] text-[18px] font-semibold leading-[24px] ${
            meetingLink
              ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
              : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
          }`}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

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
            aria-checked={notificationsOn}
            onClick={() => setNotificationsOn((v) => !v)}
            className={`flex shrink-0 flex-col items-center rounded-[var(--border-radius-10,10px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-base,#757575)] px-[var(--spacing-xxxs,2px)] transition-all ${
              notificationsOn
                ? "bg-[var(--surface-strongest,#212121)] pt-[var(--spacing-xxxs,2px)] pb-[var(--spacing-md,16px)]"
                : "bg-[var(--surface-base,white)] pt-[var(--spacing-md,16px)] pb-[var(--spacing-xxxs,2px)]"
            }`}
          >
            <span
              className={`size-[24px] rounded-[var(--border-radius-8,8px)] ${
                notificationsOn ? "bg-[var(--content-subtle,white)]" : "bg-[var(--content-base,#212121)]"
              }`}
            />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className={`flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] ${
          isValid
            ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
            : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
        }`}
      >
        {isEditing ? "Salvar alterações" : "Salvar sessão"}
      </button>

      <ClientPickerSheet
        open={pickerOpen}
        clients={clients}
        initialSelectedId={clientId}
        onClose={() => setPickerOpen(false)}
        onConfirm={(id) => {
          setClientId(id);
          setPickerOpen(false);
        }}
      />
    </form>
  );
}
