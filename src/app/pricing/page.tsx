"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppXIcon, SingleCheckIcon, VerifiedIcon } from "@/components/icons";
import TitleAction from "@/components/TitleAction";

type Plan = "monthly" | "yearly";

type PricingData = {
  monthly: number;
  yearly: number;
  currency: string;
};

const FEATURES = [
  "Clientes ilimitados",
  "Integração com Google Meet",
  "Agenda sem limite de sessões",
  "Suporte prioritário",
];

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

export default function PricingPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("monthly");
  const [prices, setPrices] = useState<PricingData | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPrices(data);
      })
      .catch(() => setErrorMsg("Não foi possível carregar os preços"))
      .finally(() => setLoadingPrices(false));
  }, []);

  function handleSubscribe() {
    setSubmitting(true);
    router.push(`/checkout?plan=${plan}`);
  }

  const displayedAmount = prices ? (plan === "monthly" ? prices.monthly : prices.yearly) : null;
  const displayedSuffix = plan === "monthly" ? "/mês" : "/ano";

  const savingsPercent =
    prices && prices.monthly > 0
      ? Math.round((1 - prices.yearly / 12 / prices.monthly) * 100)
      : null;

  return (
    <div className="flex min-h-screen w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-subtle,#fafafa)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Assinatura" href="/dashboard" />

      <div className="relative flex w-full flex-col rounded-[var(--sheet-border-radius,32px)] bg-[var(--surface-base,white)]">
        <div className="flex w-full flex-col gap-[var(--sheet-gap,16px)] p-[var(--sheet-padding,24px)]">
          <div className="flex w-full items-start gap-[var(--spacing-md,16px)]">
            <div className="flex flex-1 flex-col items-start gap-[var(--spacing-xxs,4px)]">
              <h1 className="font-[family-name:var(--typography-heading-h2-font-family)] font-[var(--typography-heading-h2-font-weight,600)] text-[length:var(--typography-heading-h2-font-size,24px)] leading-[var(--typography-heading-h2-line-height,32px)] tracking-[var(--typography-heading-h2-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
                Lumo Pro
              </h1>
              <p className="font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-strongest,#757575)]">
                Escolha o plano ideal para você.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              aria-label="Fechar"
              className="shrink-0 text-[color:var(--content-base,#212121)]"
            >
              <AppXIcon size={24} />
            </button>
          </div>

          <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
            {savingsPercent !== null && savingsPercent > 0 && (
              <div className="flex items-center justify-center gap-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-lg,16px)] bg-[var(--feedback-success-subtlest,#efffe5)] p-[var(--spacing-xxs,4px)]">
                <VerifiedIcon size={16} className="text-[color:var(--feedback-success-strongest,#1b6303)]" />
                <span className="font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--feedback-success-strongest,#1b6303)]">
                  Economize {savingsPercent}% no plano anual
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-[var(--spacing-xxs,4px)]">
              <p className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)] text-[color:var(--content-base,#212121)]">
                {loadingPrices || displayedAmount == null
                  ? "—"
                  : formatPrice(displayedAmount, prices!.currency)}
              </p>
              <p className="font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
                {displayedSuffix}
              </p>
            </div>

            <div className="flex w-full items-center gap-[var(--spacing-horizontal-sm,8px)] rounded-[var(--border-radius-xxxl,32px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtle,#bdbdbd)] bg-[var(--surface-base,white)] p-[var(--spacing-padding-xs,4px)]">
              <button
                type="button"
                onClick={() => setPlan("monthly")}
                className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-xxxl,32px)] p-[var(--spacing-md,16px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] ${
                  plan === "monthly"
                    ? "border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                    : "text-[color:var(--content-base,#212121)]"
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setPlan("yearly")}
                className={`flex flex-1 items-center justify-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-xxxl,32px)] p-[var(--spacing-md,16px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] ${
                  plan === "yearly"
                    ? "border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-strongest,#212121)] text-[color:var(--content-subtle,white)]"
                    : "text-[color:var(--content-base,#212121)]"
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-[var(--spacing-xs,8px)]">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex w-full items-center gap-[var(--spacing-xs,8px)]">
                <SingleCheckIcon size={24} className="shrink-0 text-[color:var(--feedback-success-strong,#2b9c04)]" />
                <p className="flex-1 font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {errorMsg && (
            <p className="w-full text-center text-[14px] text-[color:var(--feedback-danger-strong,#991515)]">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={submitting || loadingPrices}
            className="flex h-[48px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--numbers-padding-md,16px)] disabled:opacity-60"
          >
            <VerifiedIcon size={24} className="text-[color:var(--button-primary-content-enabled,#fafafa)]" />
            <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] whitespace-nowrap text-[color:var(--button-primary-content-enabled,#fafafa)]">
              {submitting ? "Redirecionando..." : "Assinar agora"}
            </span>
          </button>

          <p className="w-full text-center font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-strongest,#757575)]">
            14 dias grátis. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
