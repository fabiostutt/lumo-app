"use client";

import { useState } from "react";

type TextFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export default function TextField({
  label,
  name,
  placeholder,
  icon,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const hasValue = value.trim().length > 0;
  const isError = !!error;
  const isFilled = hasValue && !focused && !isError;

  const labelColor = disabled
    ? "text-[color:var(--input-disabled-label,#bdbdbd)]"
    : "text-[color:var(--input-default-label,#212121)]";

  const borderColor = disabled
    ? "border-[var(--input-disabled-border-default,#bdbdbd)]"
    : isError
    ? "border-[var(--input-error-border-default,#d71d1d)]"
    : focused
    ? "border-[var(--border-strong,#212121)]"
    : isFilled
    ? "border-[var(--input-filled-border-default,#757575)]"
    : "border-[var(--input-default-border-default,#bdbdbd)]";

  const surfaceColor = disabled
    ? "bg-[var(--input-disabled-surface,#fafafa)]"
    : "bg-[var(--input-default-surface,#fafafa)]";

  const valueColor = disabled
    ? "text-[color:var(--input-disabled-content-placeholder,#bdbdbd)]"
    : isError
    ? "text-[color:var(--input-error-content-value,#212121)]"
    : isFilled
    ? "text-[color:var(--input-filled-content-value,#212121)]"
    : "text-[color:var(--input-default-content-value,#212121)]";

  const placeholderColor = disabled
    ? "placeholder:text-[color:var(--input-disabled-content-placeholder,#bdbdbd)]"
    : "placeholder:text-[color:var(--input-default-content-placeholder,#757575)]";

  const iconColor = disabled
    ? "text-[color:var(--input-disabled-content-placeholder,#bdbdbd)]"
    : "text-[color:var(--content-strongest,#757575)]";

  return (
    <div className="flex w-full flex-col gap-[var(--input-gap,4px)]">
      <label
        htmlFor={name}
        className={`font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] ${labelColor}`}
      >
        {label}
      </label>
      <div
        className={`flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid px-[var(--input-padding,16px)] ${surfaceColor} ${borderColor}`}
      >
        <span className={`shrink-0 ${iconColor}`}>{icon}</span>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] outline-none disabled:cursor-not-allowed ${valueColor} ${placeholderColor}`}
        />
      </div>
      {isError && (
        <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--input-error-supporting-text,#d71d1d)]">
          {error}
        </p>
      )}
    </div>
  );
}
