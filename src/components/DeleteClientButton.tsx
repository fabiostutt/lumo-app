"use client";

import { useState, useTransition } from "react";
import { deleteClientAction } from "@/lib/actions/delete-client";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("clientId", clientId);
      await deleteClientAction(formData);
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
          Excluir cliente
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[#212121]/80 backdrop-blur-[4px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`relative mx-4 mb-10 w-full max-w-[398px] rounded-[var(--border-radius-xxl,24px)] bg-[var(--surface-base,white)] transition-transform duration-300 ${
            open ? "translate-y-0" : "translate-y-[120%]"
          }`}
        >
          <div className="flex flex-col gap-[var(--sheet-gap,16px)] p-[var(--sheet-padding,12px)]">
            <p className="text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
              Excluir cliente?
            </p>
            <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
              Essa ação não pode ser desfeita. Todos os dados desse cliente serão removidos.
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
          </div>
        </div>
      </div>
    </>
  );
}
