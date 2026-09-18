"use client";

import { useState, useTransition } from "react";
import { deleteSessionAction } from "@/lib/actions/delete-session";
import BottomSheet from "@/components/BottomSheet";

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      await deleteSessionAction(formData);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[var(--button-height-large,56px)] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--button-danger-border,#ee9e9e)] bg-[var(--button-danger-surface-enabled,white)] px-[var(--button-padding,16px)]"
      >
        <span className="font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-danger-content-enabled,#d71d1d)]">
          Excluir sessão
        </span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
          Excluir sessão?
        </p>
        <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
          Essa ação não pode ser desfeita. O cliente não será notificado sobre o cancelamento.
        </p>
        <div className="flex w-full flex-col gap-[var(--stacks-gap-vertical,8px)]">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--button-danger-border,#ee9e9e)] bg-[var(--button-danger-surface-enabled,white)] px-[var(--button-padding,16px)]"
          >
            <span className="text-[18px] font-semibold leading-[24px] text-[color:var(--button-danger-content-enabled,#d71d1d)]">
              {isPending ? "Excluindo..." : "Sim, excluir"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding,16px)]"
          >
            <span className="text-[18px] font-semibold leading-[24px] text-[color:var(--button-tertiary-content-enabled,#212121)]">
              Cancelar
            </span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
