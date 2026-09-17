"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { User, ChevronRight, Calendar, Clock as ClockIcon, MessageCircle } from "lucide-react";
import { createSessionAction } from "@/lib/actions/create-session";

type ClientOption = { id: string; name: string; whatsapp: string | null };

export default function ScheduleSessionForm({
  clients,
  initialClientId,
}: {
  clients: ClientOption[];
  initialClientId?: string;
}) {
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platform, setPlatform] = useState<"whatsapp" | "google">("whatsapp");
  const [notificationsOn, setNotificationsOn] = useState(true);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  const meetingLink = useMemo(() => {
    if (platform === "whatsapp" && selectedClient?.whatsapp) {
      const digits = selectedClient.whatsapp.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : "";
    }
    return "";
  }, [platform, selectedClient]);

  const isValid = !!clientId && !!date && !!time;

  function handleCopy() {
    if (meetingLink) navigator.clipboard.writeText(meetingLink);
  }

  return (
    <form action={createSessionAction} className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="meetingLink" value={meetingLink} />
      <input type="hidden" name="notificationsEnabled" value={String(notificationsOn)} />

      <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
        <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
          Adicionar participante
        </p>
        <Link
          href="/clients?returnTo=/sessions/new"
          className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]"
        >
          <User size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
          <span
            className={`flex-1 text-[16px] leading-[28px] tracking-[-0.2px] ${
              selectedClient
                ? "text-[color:var(--content-base,#212121)]"
                : "text-[color:var(--input-default-content-placeholder,#757575)]"
            }`}
          >
            {selectedClient ? selectedClient.name : "Selecionar"}
          </span>
          <ChevronRight size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
        </Link>
      </div>

      <div className="flex w-full gap-[var(--stacks-gap-horizontal,16px)]">
        <div className="flex flex-1 flex-col gap-[var(--input-gap,4px)]">
          <label htmlFor="date" className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
            Data
          </label>
          <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
            <Calendar size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full flex-1 bg-transparent text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] outline-none"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-[var(--input-gap,4px)]">
          <label htmlFor="time" className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
            Hora
          </label>
          <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
            <ClockIcon size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
            <input
              id="time"
              name="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full flex-1 bg-transparent text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[var(--spacing-xs,8px)]">
        <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
          Plataforma
        </p>
        <div className="flex w-full items-center gap-[var(--spacing-horizontal-sm,8px)] rounded-[var(--border-radius-20,20px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtle,#bdbdbd)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-xs,4px)]">
          <button
            type="button"
            onClick={() => setPlatform("whatsapp")}
            className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-md,16px)] text-[18px] font-semibold leading-[24px] ${
              platform === "whatsapp"
                ? "bg-white text-[color:var(--content-base,#212121)] shadow-[0px_1px_1px_rgba(0,0,0,0.16)]"
                : "text-[color:var(--content-strongest,#757575)]"
            }`}
          >
            WhatsApp
          </button>
          <div className="h-[24px] w-px shrink-0 bg-[var(--content-strong,#bdbdbd)]" />
          <button
            type="button"
            onClick={() => setPlatform("google")}
            className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-md,16px)] text-[18px] font-semibold leading-[24px] ${
              platform === "google"
                ? "bg-white text-[color:var(--content-base,#212121)] shadow-[0px_1px_1px_rgba(0,0,0,0.16)]"
                : "text-[color:var(--content-strongest,#757575)]"
            }`}
          >
            Google
          </button>
        </div>
      </div>

      <div className="flex w-full items-end gap-[var(--spacing-xs,8px)]">
        <div className="flex flex-1 flex-col gap-[var(--input-gap,4px)]">
          <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
            Link da sessão
          </p>
          <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
            <MessageCircle size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
            <p className="flex-1 truncate text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--input-default-content-placeholder,#757575)]">
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
          Copiar
        </button>
      </div>

      <div className="flex w-full flex-col items-start rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-lg,16px)]">
        <div className="flex w-full items-center gap-[var(--spacing-md,16px)]">
          <div className="flex flex-1 flex-col items-start gap-[var(--spacing-xxxs,2px)]">
            <p className="w-full text-[16px] font-semibold leading-[24px] text-[color:var(--action-secondary-strongest,#212121)]">
              Notificações e lembretes
            </p>
            <p className="w-full text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
              Ativar alertas e confirmações de sessão
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
        Salvar sessão
      </button>
    </form>
  );
}
