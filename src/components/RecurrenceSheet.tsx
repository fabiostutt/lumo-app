"use client";

import { AppXIcon } from "@/components/icons";
import BottomSheet from "@/components/BottomSheet";
import { RECURRENCE_PRESET_LABELS, type RecurrencePreset } from "@/lib/scheduling";

const PRESETS: RecurrencePreset[] = ["none", "daily", "weekly", "biweekly", "monthly"];

type RecurrenceSheetProps = {
  open: boolean;
  selected: RecurrencePreset;
  onClose: () => void;
  onSelect: (preset: RecurrencePreset) => void;
};

export default function RecurrenceSheet({ open, selected, onClose, onSelect }: RecurrenceSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
        <div className="flex flex-1 flex-col items-start gap-[var(--spacing-xxs,4px)]">
          <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
            Selecione a recorrência
          </p>
          <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
            Frequência que as reuniões se repetem.
          </p>
        </div>
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
        {PRESETS.map((preset) => {
          const isSelected = preset === selected;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelect(preset)}
              className={`flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] px-[var(--button-padding,16px)] text-[18px] font-semibold leading-[24px] ${
                isSelected
                  ? "bg-[var(--button-primary-surface-enabled,#212121)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
                  : "bg-[var(--button-secondary-surface-enabled,#fafafa)] text-[color:var(--button-secondary-content-enabled,#212121)]"
              }`}
            >
              {RECURRENCE_PRESET_LABELS[preset]}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
