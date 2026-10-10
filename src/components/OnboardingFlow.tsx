"use client";

import { useActionState, useState } from "react";
import { Plus, GraduationCap, Calendar } from "lucide-react";
import TextField from "@/components/TextField";
import { AddUserIcon, WatchIcon } from "@/components/icons";
import { completeOnboardingAction, type CompleteOnboardingState } from "@/lib/actions/complete-onboarding";
import { AREAS } from "@/lib/vocabulary";

const TOTAL_STEPS = 4;

// Mesma lista que alimenta o vocabulário adaptável (src/lib/vocabulary.ts) —
// os labels dos chips precisam bater exatamente com AREAS pra gente saber
// qual AreaId gravar em profiles.area a partir do que foi clicado aqui.
const SPECIALTY_OPTIONS = AREAS.map((a) => a.label);

const WEEKDAY_OPTIONS: { code: string; label: string }[] = [
  { code: "mon", label: "SEG" },
  { code: "tue", label: "TER" },
  { code: "wed", label: "QUA" },
  { code: "thu", label: "QUI" },
  { code: "fri", label: "SEX" },
  { code: "sat", label: "SAB" },
  { code: "sun", label: "DOM" },
];

const DURATION_OPTIONS = [15, 30, 50, 60, 90];

function StepTrace({ step }: { step: number }) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-xs,8px)]">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-[4px] flex-1 rounded-[var(--border-radius-xxxl,32px)] ${
            i < step ? "bg-[var(--surface-strongest,#212121)]" : "bg-[var(--surface-subtle,#fafafa)]"
          }`}
        />
      ))}
    </div>
  );
}

// Linha combinada trace + "Pular" (substitui a trace sozinha + botão
// secundário no rodapé) — nova etapa de área usa isso; as demais etapas
// ainda vão migrar pra esse padrão depois.
function StepperAndSkip({ step, onSkip }: { step: number; onSkip: () => void }) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-sm,12px)]">
      <StepTrace step={step} />
      <button
        type="button"
        onClick={onSkip}
        className="flex h-[40px] shrink-0 items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-ghost-surface-enabled,transparent)] px-[var(--button-padding-small,12px)]"
      >
        <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] whitespace-nowrap text-[color:var(--button-ghost-content-enabled,#212121)]">
          Pular
        </span>
      </button>
    </div>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)]">
      {children}
    </div>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[50.75px] shrink-0 items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-extra-large,120px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid px-[var(--button-padding,16px)] ${
        selected
          ? "border-transparent bg-[var(--button-primary-surface-enabled,#212121)]"
          : "border-[var(--button-outline-border,#757575)] bg-[var(--button-outline-surface-enabled,#fafafa)]"
      }`}
    >
      <span
        className={`font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] whitespace-nowrap ${
          selected
            ? "text-[color:var(--button-primary-content-enabled,#fafafa)]"
            : "text-[color:var(--button-outline-content-enabled,#212121)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function Title({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex w-full flex-col items-start gap-[var(--section-padding,16px)]">
      <p className="w-full font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)] text-[color:var(--content-base,#212121)]">
        {title}
      </p>
      <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-strongest,#757575)]">
        {subtitle}
      </p>
    </div>
  );
}

function PrimaryButton({
  label,
  disabled,
  onClick,
  type = "button",
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] ${
        !disabled
          ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
          : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
      }`}
    >
      {label}
    </button>
  );
}

function SecondaryButton({
  label,
  onClick,
  type = "button",
  disabled,
}: {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] bg-[var(--button-secondary-surface-enabled,#fafafa)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] text-[color:var(--button-secondary-content-enabled,#212121)] disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  const [specialty, setSpecialty] = useState<string | null>(null);
  const [customSpecialty, setCustomSpecialty] = useState("");

  const [weekendExpanded, setWeekendExpanded] = useState(false);
  const [workDays, setWorkDays] = useState<string[]>([]);

  const [hoursFrom, setHoursFrom] = useState("");
  const [hoursTo, setHoursTo] = useState("");

  const [duration, setDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");

  const [state, formAction, pending] = useActionState<CompleteOnboardingState, FormData>(
    completeOnboardingAction,
    null
  );

  function toggleWorkDay(code: string) {
    setWorkDays((prev) => (prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]));
  }

  function next() {
    setStep((s) => s + 1);
  }

  const finalSpecialty = specialty === "Outros" ? customSpecialty.trim() : specialty ?? "";
  const areaId = specialty ? AREAS.find((a) => a.label === specialty)?.id ?? "outros" : "";
  const finalDuration = duration === -1 ? Number(customDuration) : duration;

  const step1Valid = !!specialty && (specialty !== "Outros" || customSpecialty.trim().length > 0);
  const step2Valid = workDays.length > 0;
  const step3Valid = !!hoursFrom && !!hoursTo;
  const step4Valid = !!finalDuration && Number.isFinite(finalDuration) && finalDuration > 0;

  const visibleWeekdays = weekendExpanded ? WEEKDAY_OPTIONS : WEEKDAY_OPTIONS.slice(0, 5);

  if (step === 5) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-between gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] px-[var(--screen-padding-base,16px)] py-[var(--screen-padding-large,24px)]">
        <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
          <StepTrace step={TOTAL_STEPS} />
        </div>

        <div className="flex w-full flex-1 flex-col items-start gap-[var(--section-padding,16px)]">
          <div className="flex h-[48px] w-[80px] items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)]">
            <AddUserIcon size={24} className="text-[color:var(--content-base,#212121)]" />
          </div>
          <Title
            title="Agora vamos cadastrar teu primeiro cliente"
            subtitle="Com um cliente cadastrado, você já poderá agendar tua primeira sessão."
          />
        </div>

        {state?.error && (
          <p className="w-full text-[14px] text-[color:var(--feedback-danger-strongest,#610d0d)]">
            {state.error}
          </p>
        )}

        <form action={formAction} className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
          <input type="hidden" name="specialty" value={finalSpecialty} />
          <input type="hidden" name="area" value={areaId} />
          {workDays.map((d) => (
            <input key={d} type="hidden" name="workDays" value={d} />
          ))}
          <input type="hidden" name="workHoursFrom" value={hoursFrom} />
          <input type="hidden" name="workHoursTo" value={hoursTo} />
          <input type="hidden" name="defaultDurationMinutes" value={finalDuration ? String(finalDuration) : ""} />
          <input type="hidden" name="nextPath" value="/clients/new?returnTo=%2Fdashboard" />
          <PrimaryButton label={pending ? "Cadastrando..." : "Cadastrar"} disabled={pending} type="submit" />
        </form>

        <form action={formAction} className="flex w-full">
          <input type="hidden" name="specialty" value={finalSpecialty} />
          <input type="hidden" name="area" value={areaId} />
          {workDays.map((d) => (
            <input key={d} type="hidden" name="workDays" value={d} />
          ))}
          <input type="hidden" name="workHoursFrom" value={hoursFrom} />
          <input type="hidden" name="workHoursTo" value={hoursTo} />
          <input type="hidden" name="defaultDurationMinutes" value={finalDuration ? String(finalDuration) : ""} />
          <input type="hidden" name="nextPath" value="/dashboard" />
          <SecondaryButton label="Explorar o Lumo primeiro" type="submit" disabled={pending} />
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between gap-[var(--slot-gap-large,40px)] bg-[var(--surface-base,white)] px-[var(--screen-padding-base,16px)] py-[var(--screen-padding-large,24px)]">
      {step === 1 || step === 2 ? (
        <StepperAndSkip step={step} onSkip={next} />
      ) : (
        <StepTrace step={step} />
      )}

      <div className="flex w-full flex-1 flex-col gap-[40px]">
        {step === 1 && (
          <>
            <IconBadge>
              <GraduationCap size={24} className="text-[color:var(--content-base,#212121)]" />
            </IconBadge>
            <Title
              title="Qual é a sua profissão?"
              subtitle="Assim deixamos o Lumo com a cara do seu atendimento."
            />
            <div className="flex w-full flex-wrap items-start gap-[var(--spacing-xs,8px)]">
              {SPECIALTY_OPTIONS.map((opt) => (
                <Pill key={opt} label={opt} selected={specialty === opt} onClick={() => setSpecialty(opt)} />
              ))}
            </div>
            {specialty === "Outros" && (
              <TextField
                label="Escreva aqui"
                name="customSpecialty"
                placeholder="Ex.: Fonoaudiologia"
                value={customSpecialty}
                onChange={setCustomSpecialty}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <IconBadge>
              <Calendar size={24} className="text-[color:var(--content-base,#212121)]" />
            </IconBadge>
            <Title
              title="Quando você atende?"
              subtitle="Vamos usar como padrão na hora de agendar. Você muda quando quiser em Ajustes."
            />
            <div className="flex w-full flex-col items-start gap-[var(--spacing-md,16px)]">
              <div className="flex w-full flex-wrap items-start justify-center gap-[var(--spacing-xs,8px)]">
                {visibleWeekdays.map((d) => (
                  <Pill
                    key={d.code}
                    label={d.label}
                    selected={workDays.includes(d.code)}
                    onClick={() => toggleWorkDay(d.code)}
                  />
                ))}
              </div>
              {!weekendExpanded && (
                <button
                  type="button"
                  onClick={() => setWeekendExpanded(true)}
                  className="flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding,16px)]"
                >
                  <Plus size={24} className="text-[color:var(--button-tertiary-content-enabled,#212121)]" />
                  <span className="font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-tertiary-content-enabled,#212121)]">
                    Incluir fim de semana
                  </span>
                </button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Title
              title="Qual são os horários que você atende normalmente?"
              subtitle="Ao agendar uma sessão, vou te indicar quais horários você tem disponíveis."
            />
            <div className="flex w-full gap-[var(--button-stack-gap-horizontal,16px)]">
              <div className="min-w-0 flex-1">
                <TextField
                  label="De"
                  name="hoursFrom"
                  type="time"
                  placeholder="HH:MM"
                  icon={<WatchIcon size={24} />}
                  value={hoursFrom}
                  onChange={setHoursFrom}
                />
              </div>
              <div className="min-w-0 flex-1">
                <TextField
                  label="Até"
                  name="hoursTo"
                  type="time"
                  placeholder="HH:MM"
                  icon={<WatchIcon size={24} />}
                  value={hoursTo}
                  onChange={setHoursTo}
                />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Title
              title="Qual é a duração das tuas sessões?"
              subtitle="Vou usar esta informação como base para as sessões e te avisar se houver conflito de agenda."
            />
            <div className="flex w-full flex-wrap items-start gap-[var(--spacing-xs,8px)]">
              {DURATION_OPTIONS.map((min) => (
                <Pill
                  key={min}
                  label={`${min} min`}
                  selected={duration === min}
                  onClick={() => setDuration(min)}
                />
              ))}
              <Pill label="Outro" selected={duration === -1} onClick={() => setDuration(-1)} />
            </div>
            {duration === -1 && (
              <TextField
                label="Qual é a duração da sessão?"
                name="customDuration"
                placeholder="Ex.: 120 min"
                icon={<WatchIcon size={24} />}
                value={customDuration}
                onChange={setCustomDuration}
              />
            )}
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-[var(--button-stack-gap-vertical,8px)]">
        <PrimaryButton
          label="Continuar"
          disabled={
            (step === 1 && !step1Valid) ||
            (step === 2 && !step2Valid) ||
            (step === 3 && !step3Valid) ||
            (step === 4 && !step4Valid)
          }
          onClick={next}
        />
        {step !== 1 && step !== 2 && <SecondaryButton label="Pular por agora" onClick={next} />}
      </div>
    </div>
  );
}
