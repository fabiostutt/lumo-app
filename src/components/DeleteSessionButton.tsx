"use client";

import { useState, useTransition } from "react";
import { AppXIcon } from "@/components/icons";
import { deleteSessionAction } from "@/lib/actions/delete-session";
import BottomSheet from "@/components/BottomSheet";

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("sessionId", sessionId);
        await deleteSessionAction(formData);
      } catch (err) {
        // redirect() dentro da server action lança um erro especial que
        // precisa continuar subindo para o Next.js navegar — não é uma falha.
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Não foi possível excluir a sessão");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[var(--button-height-large,56px)] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] bg-[var(--button-danger-primary-surface-enabled,#fafafa)] px-[var(--button-padding,16px)]"
      >
        <span className="font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-danger-primary-content-enabled,#d71d1d)]">
          Excluir sessão
        </span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
          <div className="flex flex-1 flex-col items-start">
            <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
              Excluir sessão?
            </p>
            <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-strongest,#757575)]">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-[24px] shrink-0 items-center justify-center text-[color:var(--content-base,#212121)]"
            aria-label="Fechar"
          >
            <AppXIcon size={24} />
          </button>
        </div>

        {error && (
          <p className="w-full text-[14px] text-[color:var(--feedback-danger-strong,#991515)]">
            {error}
          </p>
        )}

        <div className="flex w-full items-start justify-end gap-[var(--stacks-gap-vertical,8px)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding-small,12px)]"
          >
            <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-tertiary-content-enabled,#212121)] whitespace-nowrap">
              Cancelar
            </span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex h-[40px] items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-danger-tertiary-surface-enabled,#d71d1d)] px-[var(--button-padding-small,12px)]"
          >
            <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-danger-tertiary-content-enabled,#fafafa)] whitespace-nowrap">
              {isPending ? "Excluindo..." : "Excluir"}
            </span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
