"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomSheet from "@/components/BottomSheet";
import { SingleCheckIcon } from "@/components/icons";
import { useVocabulary } from "@/components/VocabularyProvider";
import { getPaywallCopy, getChecks, type ProFeature, type ProPaywallMeta } from "@/lib/pro-gate";
import { track } from "@/lib/track";

type PricingData = { monthly: number; yearly: number; currency: string };

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

export default function ProPaywallSheet({
  feature,
  meta,
  open,
  onClose,
}: {
  feature: ProFeature;
  meta?: ProPaywallMeta;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const vocab = useVocabulary();
  const [prices, setPrices] = useState<PricingData | null>(null);

  useEffect(() => {
    if (!open) return;
    track("paywall_viewed", { feature });
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPrices(data);
      })
      .catch(() => setPrices(null));
  }, [open, feature]);

  const copy = getPaywallCopy(feature, vocab, meta);
  const checks = getChecks(feature, vocab);

  function handleCta() {
    track("paywall_cta_clicked", { feature });
    const params = new URLSearchParams({ origem: feature, retorno: pathname });
    router.push(`/pricing?${params.toString()}`);
  }

  function handleDismiss() {
    track("paywall_dismissed", { feature });
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleDismiss}>
      <div className="flex w-full flex-col items-start gap-[var(--spacing-xxs,4px)]">
        <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,500)] text-[length:var(--typography-heading-h4-font-size,14px)] leading-[var(--typography-heading-h4-line-height,20px)] text-[color:var(--content-strongest,#757575)]">
          {copy.eyebrow}
        </p>
        <h2 className="font-[family-name:var(--typography-heading-h2-font-family)] font-[var(--typography-heading-h2-font-weight,600)] text-[length:var(--typography-heading-h2-font-size,24px)] leading-[var(--typography-heading-h2-line-height,32px)] tracking-[var(--typography-heading-h2-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
          {copy.title}
        </h2>
        <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-strongest,#757575)]">
          {copy.subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
        {checks.map((label) => (
          <div key={label} className="flex w-full items-center gap-[var(--spacing-xs,8px)]">
            <SingleCheckIcon size={24} className="shrink-0 text-[color:var(--feedback-success-strong,#2b9c04)]" />
            <p className="flex-1 font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
        <button
          type="button"
          onClick={handleCta}
          className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding,16px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] text-[color:var(--button-primary-content-enabled,#fafafa)]"
        >
          Ver planos do Pro
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-tertiary-surface-enabled,#eee)] px-[var(--button-padding,16px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] text-[color:var(--content-base,#212121)]"
        >
          Agora não
        </button>

        <div className="flex w-full flex-col items-center gap-[var(--spacing-xxs,4px)] pt-[var(--spacing-xxs,4px)]">
          {prices && (
            <p className="w-full text-center font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-strongest,#757575)]">
              A partir de {formatPrice(prices.yearly / 12, prices.currency)}/mês, cobrado anualmente. Cancele quando quiser.
            </p>
          )}
          <p className="w-full text-center font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-strongest,#757575)]">
            Seus {vocab.person(2)} e {vocab.event(2)} continuam aqui.
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
