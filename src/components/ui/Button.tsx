"use client";

import React from "react";

type ButtonVariant = "Primary" | "Secondary" | "Tertiary" | "Outline";
type ButtonSize = "Large" | "Medium" | "Small";
type ButtonTone = "default" | "Danger" | "Destructive";

type ButtonProps = {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
};

const sizeTokens = {
  Large: { height: 56, px: 16, radius: 16, fontSize: 20, fontWeight: 500, letterSpacing: "-0.4px" },
  Medium: { height: 48, px: 16, radius: 12, fontSize: 18, fontWeight: 600, letterSpacing: "0px" },
  Small: { height: 40, px: 12, radius: 8, fontSize: 18, fontWeight: 600, letterSpacing: "0px" },
};

const variantTokens: Record<
  ButtonVariant,
  Record<
    ButtonTone,
    {
      bg: string;
      color: string;
      hoverBg: string;
      hoverColor?: string;
      activeBg: string;
      activeColor?: string;
      disabledBg: string;
      disabledColor: string;
      border?: string;
      hoverBorder?: string;
      activeBorder?: string;
      disabledBorder?: string;
    }
  >
> = {
  Primary: {
    default: { bg: "#212121", color: "#FAFAFA", hoverBg: "#616161", activeBg: "#616161", disabledBg: "#EEEEEE", disabledColor: "#9E9E9E" },
    Danger: { bg: "#991515", color: "#FBE8E8", hoverBg: "#610D0D", activeBg: "#FBE8E8", activeColor: "#610D0D", disabledBg: "#FBE8E8", disabledColor: "#610D0D" },
    Destructive: { bg: "#212121", color: "#FAFAFA", hoverBg: "#616161", activeBg: "#616161", disabledBg: "#EEEEEE", disabledColor: "#9E9E9E" },
  },
  Secondary: {
    default: { bg: "#FAFAFA", color: "#212121", hoverBg: "#EEEEEE", activeBg: "#EEEEEE", disabledBg: "#9E9E9E", disabledColor: "#616161" },
    Danger: { bg: "#FAFAFA", color: "#212121", hoverBg: "#EEEEEE", activeBg: "#EEEEEE", disabledBg: "#9E9E9E", disabledColor: "#616161" },
    Destructive: { bg: "#FAFAFA", color: "#212121", hoverBg: "#EEEEEE", activeBg: "#EEEEEE", disabledBg: "#9E9E9E", disabledColor: "#616161" },
  },
  Tertiary: {
    default: { bg: "#EEEEEE", color: "#212121", hoverBg: "#E0E0E0", activeBg: "#BDBDBD", disabledBg: "#FAFAFA", disabledColor: "#9E9E9E" },
    Danger: { bg: "#EEEEEE", color: "#212121", hoverBg: "#E0E0E0", activeBg: "#BDBDBD", disabledBg: "#FAFAFA", disabledColor: "#9E9E9E" },
    Destructive: { bg: "#FFFFFF", color: "#D71D1D", border: "1px solid #EE9E9E", hoverBg: "#FFFFFF", hoverBorder: "1px solid #D71D1D", activeBg: "#FBE8E8", activeBorder: "1px solid #D71D1D", disabledBg: "#FFFFFF", disabledColor: "#EE9E9E", disabledBorder: "1px solid #EE9E9E" },
  },
  Outline: {
    default: { bg: "#FAFAFA", color: "#212121", border: "1px solid #757575", hoverBg: "#FAFAFA", activeBg: "#EEEEEE", disabledBg: "#FAFAFA", disabledColor: "#9E9E9E", disabledBorder: "1px solid #BDBDBD" },
    Danger: { bg: "#FAFAFA", color: "#212121", border: "1px solid #757575", hoverBg: "#FAFAFA", activeBg: "#EEEEEE", disabledBg: "#FAFAFA", disabledColor: "#9E9E9E", disabledBorder: "1px solid #BDBDBD" },
    Destructive: { bg: "#FAFAFA", color: "#212121", border: "1px solid #757575", hoverBg: "#FAFAFA", activeBg: "#EEEEEE", disabledBg: "#FAFAFA", disabledColor: "#9E9E9E", disabledBorder: "1px solid #BDBDBD" },
  },
};

export function Button({
  label = "Label",
  variant = "Primary",
  size = "Large",
  tone = "default",
  disabled = false,
  leadingIcon,
  trailingIcon,
  onClick,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const s = sizeTokens[size];
  const v = variantTokens[variant][tone];

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: s.height,
    paddingLeft: s.px,
    paddingRight: s.px,
    borderRadius: s.radius,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontFamily: "Inter, sans-serif",
    letterSpacing: s.letterSpacing,
    lineHeight: "24px",
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    background: disabled ? v.disabledBg : v.bg,
    color: disabled ? v.disabledColor : v.color,
    border: disabled ? v.disabledBorder || "none" : v.border || "none",
    width: fullWidth ? "100%" : undefined,
    transition: "background 0.15s, color 0.15s, border 0.15s",
    outline: "none",
  };

  return (
    <button
      style={style}
      disabled={disabled}
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = v.hoverBg;
        if (v.hoverBorder) e.currentTarget.style.border = v.hoverBorder;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = v.bg;
        e.currentTarget.style.border = v.border || "none";
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = v.activeBg;
        if (v.activeColor) e.currentTarget.style.color = v.activeColor;
        if (v.activeBorder) e.currentTarget.style.border = v.activeBorder;
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = v.hoverBg;
        e.currentTarget.style.color = v.color;
      }}
    >
      {leadingIcon && (
        <span style={{ width: 24, height: 24, flexShrink: 0, display: "flex" }}>{leadingIcon}</span>
      )}
      <span>{label}</span>
      {trailingIcon && (
        <span style={{ width: 24, height: 24, flexShrink: 0, display: "flex" }}>{trailingIcon}</span>
      )}
    </button>
  );
}

export default Button;
