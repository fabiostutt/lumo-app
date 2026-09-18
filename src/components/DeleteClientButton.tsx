"use client";

import { deleteClientAction } from "@/lib/actions/delete-client";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <form
      action={deleteClientAction}
      onSubmit={(e) => {
        if (!confirm("Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        className="flex h-[var(--button-height-large,56px)] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--button-danger-border,#ee9e9e)] bg-[var(--button-danger-surface-enabled,white)] px-[var(--button-padding,16px)]"
      >
        <span className="font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-danger-content-enabled,#d71d1d)]">
          Excluir cliente
        </span>
      </button>
    </form>
  );
}
