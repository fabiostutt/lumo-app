"use client";

import { useState } from "react";
import { User, MessageCircle, Mail, CreditCard } from "lucide-react";
import { createClientAction } from "@/lib/actions/create-client";

function TextField({
  label,
  name,
  placeholder,
  icon,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
      <label
        htmlFor={name}
        className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]"
      >
        {label}
      </label>
      <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
        <span className="shrink-0 text-[color:var(--content-strongest,#757575)]">{icon}</span>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="flex-1 bg-transparent text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] outline-none placeholder:text-[color:var(--input-default-content-placeholder,#757575)]"
        />
      </div>
    </div>
  );
}

export default function ClientForm() {
  const [name, setName] = useState("");
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
      />
      <TextField
        label="E-mail"
        name="email"
        placeholder="mail@mail.com"
        icon={<Mail size={24} strokeWidth={1.75} />}
        type="email"
      />
      <TextField
        label="CPF"
        name="cpf"
        placeholder="000.000.000-00"
        icon={<CreditCard size={24} strokeWidth={1.75} />}
      />

      <div className="flex w-full flex-col gap-[var(--spacing-xs,8px)]">
        <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
          Tipo de sessão
        </p>
        <div className="flex w-full items-center gap-[var(--spacing-horizontal-sm,8px)] rounded-[var(--border-radius-20,20px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtle,#bdbdbd)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-xs,4px)]">
          <button
            type="button"
            onClick={() => setSessionType("online")}
            className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-md,16px)] text-[18px] font-semibold leading-[24px] ${
              sessionType === "online"
                ? "bg-white text-[color:var(--content-base,#212121)] shadow-[0px_1px_1px_rgba(0,0,0,0.16)]"
                : "text-[color:var(--content-strongest,#757575)]"
            }`}
          >
            Online
          </button>
          <div className="h-[24px] w-px shrink-0 bg-[var(--content-strong,#bdbdbd)]" />
          <button
            type="button"
            onClick={() => setSessionType("presencial")}
            className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] p-[var(--spacing-md,16px)] text-[18px] font-semibold leading-[24px] ${
              sessionType === "presencial"
                ? "bg-white text-[color:var(--content-base,#212121)] shadow-[0px_1px_1px_rgba(0,0,0,0.16)]"
                : "text-[color:var(--content-strongest,#757575)]"
            }`}
          >
            Presencial
          </button>
        </div>
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
