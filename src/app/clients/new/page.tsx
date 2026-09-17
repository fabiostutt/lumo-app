import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)] pt-[var(--spacing-xl,24px)]">
      <div className="flex items-center gap-[var(--spacing-xs,8px)]">
        <Link
          href="/dashboard"
          className="flex size-[48px] items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)]"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} strokeWidth={1.75} />
        </Link>
        <h1 className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
          Cadastrar cliente
        </h1>
      </div>

      <ClientForm />
    </div>
  );
}
