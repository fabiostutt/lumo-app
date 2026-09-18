"use client";

import { useState } from "react";
import { User, MessageCircle, Mail, CreditCard } from "lucide-react";
import { createClientAction } from "@/lib/actions/create-client";
import SegmentedToggle from "@/components/SegmentedToggle";
import TextField from "@/components/TextField";

export default function ClientForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [sessionType, setSessionType] = useState<"online" | "presencial">("online");

  const isValid = name.trim().length > 0;

  return (
    <form action={createClientAction} className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
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

      <button
        type="submit"
        disabled={!isValid}
        className={`flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] px-[var(--button-padding,16px)] text-[20px] font-medium leading-[24px] tracking-[-0.4px] ${
          isValid
            ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
            : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
        }`}
      >
        Salvar cliente
      </button>
    </form>
  );
}
