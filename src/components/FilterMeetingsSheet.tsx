"use client";

import { AppXIcon } from "@/components/icons";
import BottomSheet from "@/components/BottomSheet";

export type MeetingFilter = "all" | "completed" | "confirmada" | "pendente" | "cancelada";

export const MEETING_FILTER_LABELS: Record<MeetingFilter, string> = {
  all: "Todas",
  completed: "Concluídas",
  confirmada: "Confirmadas",
  pendente: "Pendentes",
  cancelada: "Canceladas",
};

const FILTERS: MeetingFilter[] = ["all", "completed", "confirmada", "pendente", "cancelada"];

type FilterMeetingsSheetProps = {
  open: boolean;
  selected: MeetingFilter;
  onClose: () => void;
  onSelect: (filter: MeetingFilter) => void;
};

export default function FilterMeetingsSheet({ open, selected, onClose, onSelect }: FilterMeetingsSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
        <p className="flex-1 font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
          Filtrar reuniões
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

      <div className="flex w-full flex-col gap-[var(--spacing-xs,8px)]">
        {FILTERS.map((filter) => {
          const isSelected = filter === selected;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelect(filter)}
              className={`flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] px-[var(--button-padding,16px)] text-[18px] font-semibold leading-[24px] ${
                isSelected
                  ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
                  : "bg-[var(--button-secondary-surface-enabled,#fafafa)] text-[color:var(--button-secondary-content-enabled,#212121)]"
              }`}
            >
              {MEETING_FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
