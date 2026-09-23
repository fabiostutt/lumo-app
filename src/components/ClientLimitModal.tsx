"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomSheet from "@/components/BottomSheet";

// Placeholder simples — o design final desse aviso ainda vai ser desenhado
// no Figma e este componente será atualizado para bater com ele.
export default function ClientLimitModal({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOpen(true));
  }, []);

  function handleClose() {
    setOpen(false);
    setTimeout(() => router.push(returnTo || "/dashboard"), 300);
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex w-full flex-col items-start gap-[var(--spacing-md,16px)]">
        <p className="text-[20px] font-semibold leading-[28px] text-[color:var(--content-base,#212121)]">
          Limite de clientes atingido
        </p>
        <p className="text-[14px] leading-[20px] text-[color:var(--content-strongest,#757575)]">
          Você atingiu o limite de 5 clientes do plano gratuito. Assine o Lumo Pro para cadastrar clientes ilimitados.
        </p>
        <Link
          href="/pricing"
          className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding,16px)] text-[16px] font-semibold text-[color:var(--button-primary-content-enabled,#fafafa)]"
        >
          Ver planos
        </Link>
      </div>
    </BottomSheet>
  );
}
