"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { User, MessageCircle, Mail, CreditCard } from "lucide-react";
import { createClientAction } from "@/lib/actions/create-client";
import { updateClientAction } from "@/lib/actions/update-client";
import SegmentedToggle from "@/components/SegmentedToggle";
import TextField from "@/components/TextField";
import DeleteClientButton from "@/components/DeleteClientButton";

type ClientFormProps = {
  clientId?: string;
  initialName?: string;
  initialWhatsapp?: string;
  initialEmail?: string;
  initialCpf?: string;
  initialSessionType?: "online" | "presencial";
};

export default function ClientForm({
  clientId,
  initialName,
  initialWhatsapp,
  initialEmail,
  initialCpf,
  initialSessionType,
}: ClientFormProps) {
  const isEditing = !!clientId;
  const [state, formAction, pending] = useActionState(
    isEditing ? updateClientAction : createClientAction,
    null
  );
  const [name, setName] = useState(initialName ?? "");
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [cpf, setCpf] = useState(initialCpf ?? "");
  const [sessionType, setSessionType] = useState<"online" | "presencial">(
    initialSessionType ?? "online"
  );

  const isValid = name.trim().length > 0;

  return (
    <form action={formAction} className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      {isEditing && <input type="hidden" name="clientId" value={clientId} />}

      <TextField
        label="Nome do cliente"
        name="name"
        placeholder="Digite o nome"
        icon={<User size={24} strokeWidth={1.75} />}
        value={name}
        onChange={setName}
      />
      <TextField
        label="Número de WhatsApp"
        name="whatsapp"
        placeholder="DDD 99999-0000"
        icon={<MessageCircle size={24} strokeWidth={1.75} />}
        value={whatsapp}
        onChange={setWhatsapp}
      />
      <TextField
        label="E-mail"
        name="email"
        placeholder="mail@mail.com"
        icon={<Mail size={24} strokeWidth={1.75} />}
        type="email"
        value={email}
        onChange={setEmail}
      />
      <TextField
        label="CPF"
        name="cpf"
        placeholder="000.000.000-00"
        icon={<CreditCard size={24} strokeWidth={1.75} />}
        value={cpf}
        onChange={setCpf}
      />

      <div className="flex w-full flex-col">
        <SegmentedToggle
          label="Tipo de sessão"
          value={sessionType}
          onChange={setSessionType}
          options={[
            { value: "online", label: "Online" },
            { value: "presencial", label: "Presencial" },
          ]}
        />
        <input type="hidden" name="sessionType" value={sessionType} />
      </div>

      {state?.error === "limit_reached" && (
        <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
          <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
            Você atingiu o limite de 5 clientes do plano Free.
          </p>
          <Link
            href="/pricing"
            className="text-[14px] font-semibold leading-[24px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] underline"
          >
            Ver planos
          </Link>
        </div>
      )}
      {state?.error && state.error !== "limit_reached" && (
        <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[#d71d1d]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || pending}
        className={`flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] ${
          isValid && !pending
            ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
            : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
        }`}
      >
        {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar cliente"}
      </button>

      {isEditing && <DeleteClientButton clientId={clientId} />}
    </form>
  );
}
