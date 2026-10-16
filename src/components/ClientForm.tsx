"use client";

import { useActionState, useEffect, useState } from "react";
import { PeopleIcon, WhatsAppIcon, MailIcon, IdIcon } from "@/components/icons";
import { createClientAction } from "@/lib/actions/create-client";
import { updateClientAction } from "@/lib/actions/update-client";
import TextField from "@/components/TextField";
import DeleteClientButton from "@/components/DeleteClientButton";
import { maskCPF, maskPhone } from "@/lib/masks";
import { useVocabulary } from "@/components/VocabularyProvider";
import { useProGate } from "@/components/ProGateProvider";

type ClientFormProps = {
  clientId?: string;
  initialName?: string;
  initialWhatsapp?: string;
  initialEmail?: string;
  initialCpf?: string;
  returnTo?: string;
};

export default function ClientForm({
  clientId,
  initialName,
  initialWhatsapp,
  initialEmail,
  initialCpf,
  returnTo,
}: ClientFormProps) {
  const isEditing = !!clientId;
  const vocab = useVocabulary();
  const { openPaywall } = useProGate();
  const [state, formAction, pending] = useActionState(
    isEditing ? updateClientAction : createClientAction,
    null
  );
  const [name, setName] = useState(initialName ?? "");
  const [whatsapp, setWhatsapp] = useState(maskPhone(initialWhatsapp ?? ""));
  const [email, setEmail] = useState(initialEmail ?? "");
  const [cpf, setCpf] = useState(maskCPF(initialCpf ?? ""));

  const isValid = name.trim().length > 0;

  useEffect(() => {
    if (state && "code" in state && state.code === "pro_required") {
      openPaywall(state.feature, state.meta);
    }
  }, [state, openPaywall]);

  return (
    <form action={formAction} className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      {isEditing && <input type="hidden" name="clientId" value={clientId} />}
      {!isEditing && returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

      <TextField
        label="Nome completo"
        name="name"
        placeholder="Digite o nome"
        icon={<PeopleIcon size={24} />}
        value={name}
        onChange={setName}
      />
      <TextField
        label="Número de WhatsApp"
        name="whatsapp"
        placeholder="11 11111-1111"
        icon={<WhatsAppIcon size={24} />}
        value={whatsapp}
        onChange={(v) => setWhatsapp(maskPhone(v))}
      />
      <TextField
        label="E-mail"
        name="email"
        placeholder="mail@mail.com"
        icon={<MailIcon size={24} />}
        type="email"
        value={email}
        onChange={setEmail}
      />
      <TextField
        label="CPF"
        name="cpf"
        placeholder="000.000.000-00"
        icon={<IdIcon size={24} />}
        value={cpf}
        onChange={(v) => setCpf(maskCPF(v))}
        error={state && "error" in state && state.error === "cpf_duplicate" ? "Esse CPF já está cadastrado." : undefined}
      />

      {state && "error" in state && state.error && state.error !== "cpf_duplicate" && (
        <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[#d71d1d]">{state.error}</p>
      )}

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
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : `Salvar ${vocab.person(1)}`}
        </button>

        {isEditing && <DeleteClientButton clientId={clientId} />}
      </div>
    </form>
  );
}
