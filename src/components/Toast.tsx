"use client";

import { Copy } from "lucide-react";

type ToastProps = {
  show: boolean;
  message: string;
};

// Sobe de baixo pra cima, fica na tela e desce pelo mesmo caminho — quem
// controla por quanto tempo `show` fica true é o chamador (useToast).
export default function Toast({ show, message }: ToastProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(24px,env(safe-area-inset-bottom))]"
      aria-live="polite"
    >
      <div
        className={`flex items-center justify-center gap-[var(--spacing-sm,12px)] rounded-[var(--button-border-radius-medium,12px)] bg-[var(--surface-strongest,#212121)]/95 px-[var(--spacing-md,16px)] py-[var(--spacing-sm,12px)] backdrop-blur-[4px] transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <Copy size={24} className="shrink-0 text-[color:var(--content-subtle,white)]" />
        <span className="whitespace-nowrap font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-subtle,white)]">
          {message}
        </span>
      </div>
    </div>
  );
}
