"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppXIcon, PeopleIcon } from "@/components/icons";
import BottomSheet from "@/components/BottomSheet";

type ClientOption = { id: string; name: string; whatsapp: string | null };

type ClientPickerSheetProps = {
  open: boolean;
  clients: ClientOption[];
  initialSelectedId?: string;
  onClose: () => void;
  onConfirm: (clientId: string) => void;
};

export default function ClientPickerSheet({
  open,
  clients,
  initialSelectedId,
  onClose,
  onConfirm,
}: ClientPickerSheetProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? "");

  useEffect(() => {
    if (open) setSelectedId(initialSelectedId ?? "");
  }, [open, initialSelectedId]);

  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [clients, query]
  );

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex max-h-[60vh] w-full flex-col gap-[var(--sheet-gap,16px)] overflow-y-auto">
        <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
          <p className="flex-1 font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
            Selecionar participante
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-[24px] items-center justify-center text-[color:var(--content-base,#212121)]"
            aria-label="Fechar"
          >
            <AppXIcon size={24} />
          </button>
        </div>

        <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
          <Search size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente"
            className="flex-1 bg-transparent text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] outline-none placeholder:text-[color:var(--input-default-content-placeholder,#757575)]"
          />
        </div>

        <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
          <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
            {filtered.length} {filtered.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
          </p>

          {filtered.map((client) => {
            const isSelected = client.id === selectedId;
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => setSelectedId(client.id)}
                className={`flex h-[72px] w-full items-center gap-[var(--spacing-md,16px)] rounded-[20px] border-solid bg-[var(--surface-base,white)] p-[var(--spacing-md,16px)] text-left ${
                  isSelected
                    ? "border-[length:var(--border-width-xs,2px)] border-[var(--border-strong,#212121)]"
                    : "border-[length:var(--border-width-xxxs,0.5px)] border-[var(--border-subtlest,#eee)]"
                }`}
              >
                <PeopleIcon size={24} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
                <div className="flex flex-1 flex-col items-start overflow-hidden">
                  <p className="w-full truncate font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
                    {client.name}
                  </p>
                  <p className="w-full truncate font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,24px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
                    {client.whatsapp || "Sem WhatsApp cadastrado"}
                  </p>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="w-full py-8 text-center text-[14px] text-[color:var(--content-strongest,#757575)]">
              Nenhum cliente encontrado.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!selectedId}
        onClick={() => selectedId && onConfirm(selectedId)}
        className={`flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] px-[var(--numbers-padding-md,16px)] text-[18px] font-semibold leading-[24px] ${
          selectedId
            ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
            : "bg-[var(--button-primary-surface-disabled,#eee)] text-[color:var(--button-primary-content-disabled,#9e9e9e)]"
        }`}
      >
        Confirmar participante
      </button>
    </BottomSheet>
  );
}
