"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import TitleAction from "@/components/TitleAction";
import BottomSheet from "@/components/BottomSheet";
import TextField from "@/components/TextField";
import { WhatsAppIcon, IdIcon, PeopleIcon } from "@/components/icons";
import { updateProfileFieldAction, type UpdateProfileState } from "@/lib/actions/update-profile";
import { maskPhone } from "@/lib/masks";
import { createClient } from "@/lib/supabase/client";

type ProfileScreenProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  whatsapp: string | null;
  professionalName: string | null;
  specialty: string | null;
  defaultDurationMinutes: number;
  defaultSessionType: string;
};

const DURATION_OPTIONS = [30, 45, 50, 60, 90];
const SESSION_TYPE_OPTIONS = ["Online", "Presencial"];

function ProfileRow({
  label,
  value,
  trailing = true,
  onClick,
}: {
  label: string;
  value: string;
  trailing?: boolean;
  onClick?: () => void;
}) {
  const rowClassName =
    "flex w-full items-center justify-between rounded-[var(--border-radius-sm,10px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-md,16px)]";
  const content = (
    <>
      <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
        {label}
      </p>
      <div className="flex items-center gap-[var(--spacing-xxs,4px)]">
        <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] whitespace-nowrap text-[color:var(--content-strongest,#757575)]">
          {value}
        </p>
        {trailing && <ChevronRight size={24} className="text-[color:var(--content-strongest,#757575)]" />}
      </div>
    </>
  );

  if (!onClick) {
    return <div className={rowClassName}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={rowClassName}>
      {content}
    </button>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
      {text}
    </p>
  );
}

function EditTextSheet({
  open,
  onClose,
  title,
  field,
  icon,
  initialValue,
  mask,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  field: string;
  icon: React.ReactNode;
  initialValue: string;
  mask?: (value: string) => string;
}) {
  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    async (prevState, formData) => {
      const result = await updateProfileFieldAction(prevState, formData);
      if (!result?.error) onClose();
      return result;
    },
    null
  );
  const [value, setValue] = useState(initialValue);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <form action={formAction} className="flex w-full flex-col gap-[var(--sheet-gap,16px)]">
        <input type="hidden" name="field" value={field} />
        <TextField
          label={title}
          name="value"
          placeholder={title}
          icon={icon}
          value={value}
          onChange={(v) => setValue(mask ? mask(v) : v)}
          error={state?.error}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--numbers-padding-md,16px)] disabled:opacity-60"
        >
          <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] text-[color:var(--button-primary-content-enabled,#fafafa)]">
            {pending ? "Salvando..." : "Salvar"}
          </span>
        </button>
      </form>
    </BottomSheet>
  );
}

function ChoiceSheet({
  open,
  onClose,
  title,
  field,
  options,
  currentValue,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  field: string;
  options: (string | number)[];
  currentValue: string | number;
}) {
  const [, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    async (prevState, formData) => {
      const result = await updateProfileFieldAction(prevState, formData);
      if (!result?.error) onClose();
      return result;
    },
    null
  );

  return (
    <BottomSheet open={open} onClose={onClose}>
      <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
        {title}
      </p>
      <div className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
        {options.map((option) => {
          const selected = String(option) === String(currentValue);
          return (
            <form key={option} action={formAction}>
              <input type="hidden" name="field" value={field} />
              <input type="hidden" name="value" value={option} />
              <button
                type="submit"
                disabled={pending}
                className={`flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] px-[var(--numbers-padding-md,16px)] disabled:opacity-60 ${
                  selected
                    ? "bg-[var(--button-primary-surface-enabled,#212121)]"
                    : "bg-[var(--button-tertiary-surface-enabled,#eee)]"
                }`}
              >
                <span
                  className={`font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] ${
                    selected
                      ? "text-[color:var(--button-primary-content-enabled,#fafafa)]"
                      : "text-[color:var(--button-tertiary-content-enabled,#212121)]"
                  }`}
                >
                  {typeof option === "number" ? `${option} min` : option}
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export default function ProfileScreen({
  name,
  email,
  avatarUrl,
  whatsapp,
  professionalName,
  specialty,
  defaultDurationMinutes,
  defaultSessionType,
}: ProfileScreenProps) {
  const router = useRouter();
  const [openSheet, setOpenSheet] = useState<
    "whatsapp" | "professionalName" | "specialty" | "duration" | "sessionType" | null
  >(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex w-full flex-col gap-[var(--screen-gap,24px)] bg-white p-[var(--screen-padding,16px)]">
      <TitleAction title="Perfil" href="/dashboard" />

      <div className="flex w-full items-center gap-[var(--spacing-sm,12px)]">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-[48px] shrink-0 rounded-full object-cover" />
        ) : (
          <div className="size-[48px] shrink-0 rounded-full bg-[var(--surface-subtle,#fafafa)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)]" />
        )}
        <div className="flex flex-col items-start">
          <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
            {name}
          </p>
          <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
            {specialty || "Adicione sua especialidade"}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
        <SectionTitle text="Contato" />
        <ProfileRow
          label="Telefone / WhatsApp"
          value={whatsapp ? maskPhone(whatsapp) : "Adicionar"}
          onClick={() => setOpenSheet("whatsapp")}
        />
        <ProfileRow label="E-mail" value={email} trailing={false} />
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
        <SectionTitle text="Profissional" />
        <ProfileRow
          label="Nome profissional"
          value={professionalName || "Adicionar"}
          onClick={() => setOpenSheet("professionalName")}
        />
        <ProfileRow
          label="Profissão / Especialidade"
          value={specialty || "Adicionar"}
          onClick={() => setOpenSheet("specialty")}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
        <SectionTitle text="Configurações" />
        <ProfileRow
          label="Duração padrão da reunião"
          value={`${defaultDurationMinutes} min`}
          onClick={() => setOpenSheet("duration")}
        />
        <ProfileRow
          label="Método padrão"
          value={defaultSessionType}
          onClick={() => setOpenSheet("sessionType")}
        />
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] bg-[var(--button-danger-primary-surface-enabled,#fafafa)] px-[var(--button-padding,16px)] disabled:opacity-60"
      >
        <span className="font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-danger-primary-content-enabled,#d71d1d)]">
          {signingOut ? "Saindo..." : "Sair da conta"}
        </span>
      </button>

      <EditTextSheet
        open={openSheet === "whatsapp"}
        onClose={() => setOpenSheet(null)}
        title="Telefone / WhatsApp"
        field="whatsapp"
        icon={<WhatsAppIcon size={24} />}
        initialValue={maskPhone(whatsapp ?? "")}
        mask={maskPhone}
      />
      <EditTextSheet
        open={openSheet === "professionalName"}
        onClose={() => setOpenSheet(null)}
        title="Nome profissional"
        field="professional_name"
        icon={<IdIcon size={24} />}
        initialValue={professionalName ?? ""}
      />
      <EditTextSheet
        open={openSheet === "specialty"}
        onClose={() => setOpenSheet(null)}
        title="Profissão / Especialidade"
        field="specialty"
        icon={<PeopleIcon size={24} />}
        initialValue={specialty ?? ""}
      />
      <ChoiceSheet
        open={openSheet === "duration"}
        onClose={() => setOpenSheet(null)}
        title="Duração padrão da reunião"
        field="default_duration_minutes"
        options={DURATION_OPTIONS}
        currentValue={defaultDurationMinutes}
      />
      <ChoiceSheet
        open={openSheet === "sessionType"}
        onClose={() => setOpenSheet(null)}
        title="Método padrão"
        field="default_session_type"
        options={SESSION_TYPE_OPTIONS}
        currentValue={defaultSessionType}
      />
    </div>
  );
}
