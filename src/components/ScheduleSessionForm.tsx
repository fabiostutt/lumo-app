"use client";

import { useActionState, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { PeopleIcon, ScheduleIcon, WatchIcon, WhatsAppIcon } from "@/components/icons";
import { createSessionAction } from "@/lib/actions/create-session";
import { updateSessionAction } from "@/lib/actions/update-session";
import ClientPickerSheet from "@/components/ClientPickerSheet";
import SegmentedToggle from "@/components/SegmentedToggle";
import TextField from "@/components/TextField";
import DeleteSessionButton from "@/components/DeleteSessionButton";
import { WEEKDAY_LABELS, WEEKDAYS_BUSINESS, generateRecurrenceDates } from "@/lib/scheduling";

type ClientOption = { id: string; name: string; whatsapp: string | null; email?: string | null };

type ScheduleSessionFormProps = {
  clients: ClientOption[];
  initialClientId?: string;
  sessionId?: string;
  initialDate?: string;
  initialTime?: string;
  initialNotificationsOn?: boolean;
  initialMeetingLink?: string | null;
  initialPlatform?: "whatsapp" | "google";
  initialDurationMinutes?: number;
};

export default function ScheduleSessionForm({
  clients,
  initialClientId,
  sessionId,
  initialDate,
  initialTime,
  initialNotificationsOn,
  initialMeetingLink,
  initialPlatform,
  initialDurationMinutes,
}: ScheduleSessionFormProps) {
  const isEditing = !!sessionId;

  const [state, formAction, pending] = useActionState(
    isEditing ? updateSessionAction : createSessionAction,
    null
  );

  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState(initialTime ?? "");
  // Duração fica de fora da UI por enquanto — vai ser definida no onboarding
  // do profissional; aqui só repassamos o padrão do perfil pro backend.
  const duration = String(initialDurationMinutes ?? 50);
  const [platform, setPlatform] = useState<"whatsapp" | "google">(initialPlatform ?? "whatsapp");
  const [notificationsOn, setNotificationsOn] = useState(initialNotificationsOn ?? true);
  const [copied, setCopied] = useState(false);
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  function toggleWeekday(day: number) {
    setRecurrenceWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  const recurrencePreviewDates = useMemo(() => {
    if (!recurrenceEnabled || !date) return [];
    return generateRecurrenceDates(date, recurrenceWeekdays, recurrenceInterval);
  }, [recurrenceEnabled, date, recurrenceWeekdays, recurrenceInterval]);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  const computedLink = useMemo(() => {
    if (platform === "whatsapp" && selectedClient?.whatsapp) {
      const digits = selectedClient.whatsapp.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : "";
    }
    return "";
  }, [platform, selectedClient]);

  const meetingLink = isEditing && initialMeetingLink ? initialMeetingLink : computedLink;

  // No Google ainda sem link salvo, o Meet só é gerado ao salvar (criando o
  // evento de verdade na Calendar API) — mostrar um campo vazio "O link
  // aparecerá aqui" seria enganoso, e criar o evento antes da hora geraria
  // convites órfãos toda vez que alguém mudasse algo no formulário antes de
  // salvar. Trocamos por um aviso.
  const showMeetingLinkField = platform === "whatsapp" || !!meetingLink;

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
    <form action={formAction} className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      {isEditing && <input type="hidden" name="sessionId" value={sessionId} />}
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="meetingLink" value={meetingLink} />
      <input type="hidden" name="notificationsEnabled" value={String(notificationsOn)} />
      <input type="hidden" name="platform" value={platform} />
      {!isEditing && (
        <>
          <input type="hidden" name="recurrenceEnabled" value={String(recurrenceEnabled)} />
          <input type="hidden" name="recurrenceWeekdays" value={recurrenceWeekdays.join(",")} />
          <input type="hidden" name="recurrenceInterval" value={recurrenceInterval} />
        </>
      )}

      {state?.error && (
        <p className="w-full rounded-[var(--border-radius-lg,16px)] bg-[var(--feedback-danger-subtlest,#fbe8e8)] p-[var(--spacing-padding-lg,16px)] text-[14px] text-[color:var(--feedback-danger-strongest,#610d0d)]">
          {state.error}
        </p>
      )}

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
          <PeopleIcon size={24} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
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
            icon={<ScheduleIcon size={24} />}
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
            icon={<WatchIcon size={24} />}
            value={time}
            onChange={setTime}
          />
        </div>
      </div>

      <input type="hidden" name="duration" value={duration} />

      {!isEditing && (
        <div className="flex w-full flex-col items-start rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-lg,16px)]">
          <div className="flex w-full items-center gap-[var(--spacing-md,16px)]">
            <div className="flex flex-1 flex-col items-start">
              <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--action-secondary-strongest,#212121)]">
                Repetir sessão
              </p>
              <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
                Cria as próximas sessões automaticamente
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={recurrenceEnabled}
              onClick={() => setRecurrenceEnabled((v) => !v)}
              className={`flex shrink-0 flex-col items-center rounded-[var(--border-radius-10,10px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-base,#757575)] px-[var(--spacing-xxxs,2px)] transition-all ${
                recurrenceEnabled
                  ? "bg-[var(--surface-strongest,#212121)] pt-[var(--spacing-xxxs,2px)] pb-[var(--spacing-md,16px)]"
                  : "bg-[var(--surface-base,white)] pt-[var(--spacing-md,16px)] pb-[var(--spacing-xxxs,2px)]"
              }`}
            >
              <span
                className={`size-[24px] rounded-[var(--border-radius-8,8px)] ${
                  recurrenceEnabled ? "bg-[var(--content-subtle,white)]" : "bg-[var(--content-base,#212121)]"
                }`}
              />
            </button>
          </div>

          {recurrenceEnabled && (
            <div className="flex w-full flex-col gap-[var(--spacing-md,16px)] pt-[var(--spacing-md,16px)]">
              <div className="flex w-full gap-[var(--spacing-xs,8px)]">
                {(() => {
                  const weeklyDay = date ? new Date(`${date}T00:00:00`).getDay() : null;
                  const isWeeklySelected =
                    weeklyDay !== null && recurrenceWeekdays.length === 1 && recurrenceWeekdays[0] === weeklyDay;
                  const isBusinessSelected =
                    recurrenceWeekdays.length === WEEKDAYS_BUSINESS.length &&
                    WEEKDAYS_BUSINESS.every((d) => recurrenceWeekdays.includes(d));

                  return (
                    <>
                      <button
                        type="button"
                        disabled={weeklyDay === null}
                        onClick={() => weeklyDay !== null && setRecurrenceWeekdays([weeklyDay])}
                        title={weeklyDay === null ? "Escolha a data primeiro" : undefined}
                        className={`flex-1 rounded-[var(--button-border-radius-small,8px)] px-[var(--button-padding-small,12px)] py-[8px] text-[14px] font-semibold disabled:opacity-40 ${
                          isWeeklySelected
                            ? "bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                            : "bg-[var(--button-tertiary-surface-enabled,#eee)] text-[color:var(--button-tertiary-content-enabled,#212121)]"
                        }`}
                      >
                        Semanal
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurrenceWeekdays(WEEKDAYS_BUSINESS)}
                        className={`flex-1 rounded-[var(--button-border-radius-small,8px)] px-[var(--button-padding-small,12px)] py-[8px] text-[14px] font-semibold ${
                          isBusinessSelected
                            ? "bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                            : "bg-[var(--button-tertiary-surface-enabled,#eee)] text-[color:var(--button-tertiary-content-enabled,#212121)]"
                        }`}
                      >
                        Dias úteis
                      </button>
                    </>
                  );
                })()}
              </div>

              <div className="flex w-full items-center justify-between gap-[4px]">
                {WEEKDAY_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleWeekday(index)}
                    className={`flex size-[40px] items-center justify-center rounded-full text-[14px] font-semibold ${
                      recurrenceWeekdays.includes(index)
                        ? "bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                        : "bg-[var(--surface-subtle,#fafafa)] text-[color:var(--content-strongest,#757575)]"
                    }`}
                  >
                    {label[0]}
                  </button>
                ))}
              </div>

              <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
                <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] text-[color:var(--content-base,#212121)]">
                  Repetir a cada
                </p>
                <div className="flex w-full gap-[var(--spacing-xs,8px)]">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRecurrenceInterval(n)}
                      className={`flex-1 rounded-[var(--button-border-radius-small,8px)] px-[var(--button-padding-small,12px)] py-[8px] text-[14px] font-semibold ${
                        recurrenceInterval === n
                          ? "bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                          : "bg-[var(--button-tertiary-surface-enabled,#eee)] text-[color:var(--button-tertiary-content-enabled,#212121)]"
                      }`}
                    >
                      {n === 1 ? "1 semana" : `${n} semanas`}
                    </button>
                  ))}
                </div>
              </div>

              {recurrencePreviewDates.length > 1 && (
                <p className="w-full font-[family-name:var(--typography-body-small-font-family)] text-[14px] text-[color:var(--content-strongest,#757575)]">
                  Serão criadas {recurrencePreviewDates.length} sessões, até{" "}
                  {(() => {
                    const [, m, d] = recurrencePreviewDates[recurrencePreviewDates.length - 1].split("-");
                    return `${d}/${m}`;
                  })()}
                  .
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <SegmentedToggle
        label="Plataforma"
        value={platform}
        onChange={setPlatform}
        options={[
          { value: "whatsapp", label: "WhatsApp" },
          { value: "google", label: "Google" },
        ]}
      />

      {showMeetingLinkField ? (
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
              <WhatsAppIcon size={24} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
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
      ) : (
        <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
          O link do Google Meet é gerado automaticamente ao salvar.
        </p>
      )}

      <div className="flex w-full flex-col items-start rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-lg,16px)]">
        <div className="flex w-full items-center gap-[var(--spacing-md,16px)]">
          <div className="flex flex-1 flex-col items-start">
            <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--action-secondary-strongest,#212121)]">
              Notificações e lembretes
            </p>
            <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
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

      <div className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
        <button
          type="submit"
          disabled={!isValid || pending}
          className={`flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] ${
            isValid && !pending
              ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
              : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
          }`}
        >
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar sessão"}
        </button>

        {isEditing && <DeleteSessionButton sessionId={sessionId!} />}
      </div>

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
