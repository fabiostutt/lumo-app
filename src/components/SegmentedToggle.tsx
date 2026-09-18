"use client";

type SegmentedToggleProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <div className="flex w-full flex-col gap-[var(--spacing-xs,8px)]">
      <p className="font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
        {label}
      </p>
      <div className="flex w-full items-center gap-[var(--spacing-horizontal-sm,8px)] rounded-[var(--border-radius-xxxl,32px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtle,#bdbdbd)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-xs,4px)]">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-xxxl,32px)] p-[var(--spacing-md,16px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] ${
                active
                  ? "border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                  : "text-[color:var(--content-base,#212121)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
