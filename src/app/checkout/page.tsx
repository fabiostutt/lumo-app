"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { IdIcon, LockIcon, PeopleIcon } from "@/components/icons";
import TitleAction from "@/components/TitleAction";
import TextField from "@/components/TextField";
import { maskCPF } from "@/lib/masks";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

type Plan = "monthly" | "yearly";

const PLAN_LABEL: Record<Plan, { title: string; billing: string }> = {
  monthly: { title: "Lumo Pro — Mensal", billing: "Cobrado todo mês" },
  yearly: { title: "Lumo Pro — Anual", billing: "Cobrado uma vez por ano" },
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

// Estilo dos Card Elements (número/validade/CVC) ajustado aos tokens reais do
// Lumo — cada elemento é só o campo em si, sem chrome da Stripe; o cartão
// (borda, raio, divisores) é montado com os nossos próprios tokens abaixo.
const CARD_ELEMENT_STYLE = {
  base: {
    color: "#212121",
    fontFamily: "Inter, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    letterSpacing: "-0.2px",
    "::placeholder": { color: "#757575" },
  },
  invalid: { color: "#d71d1d" },
};

function OrderSummary({ plan, priceLabel }: { plan: Plan; priceLabel: string }) {
  return (
    <div className="flex w-full items-center overflow-clip rounded-[var(--border-radius-lg,16px)] border border-solid border-[var(--action-primary-subtle,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-md,16px)] text-[color:var(--content-base,#212121)]">
      <div className="flex flex-1 flex-col items-start overflow-clip">
        <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)]">
          {PLAN_LABEL[plan].title}
        </p>
        <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)]">
          {PLAN_LABEL[plan].billing}
        </p>
      </div>
      <p className="whitespace-nowrap font-[family-name:var(--typography-body-large-font-family)] font-[var(--typography-body-large-font-weight,500)] text-[length:var(--typography-body-large-font-size,18px)] leading-[var(--typography-body-large-line-height,24px)] tracking-[var(--typography-body-large-letter-spacing,-0.2px)]">
        {priceLabel}
      </p>
    </div>
  );
}


type CardSubField = "number" | "expiry" | "cvc";

// Os três Stripe Elements são iframes independentes — não dá pra usar um
// único onFocus/onChange no wrapper. Rastreamos foco e "completude" de cada
// um pra decidir a borda do container, espelhando os states reais do Input
// (Default/Filled/Focused → Border/Subtle, Border/Base, Border/Strong).
function CardFields() {
  const [focusedField, setFocusedField] = useState<CardSubField | null>(null);
  const [completeMap, setCompleteMap] = useState<Record<CardSubField, boolean>>({
    number: false,
    expiry: false,
    cvc: false,
  });

  const isFocused = focusedField !== null;
  const isFilled = !isFocused && Object.values(completeMap).some(Boolean);

  const borderColor = isFocused
    ? "border-[var(--border-strong,#212121)]"
    : isFilled
    ? "border-[var(--input-filled-border-default,#757575)]"
    : "border-[var(--input-default-border-default,#bdbdbd)]";

  function handleFocus(field: CardSubField) {
    return () => setFocusedField(field);
  }
  function handleBlur(field: CardSubField) {
    return () => setFocusedField((current) => (current === field ? null : current));
  }
  function handleChange(field: CardSubField) {
    return (event: { complete: boolean }) =>
      setCompleteMap((prev) => ({ ...prev, [field]: event.complete }));
  }

  return (
    <div
      className={`flex w-full flex-col items-start overflow-clip rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid bg-[var(--input-default-surface,#fafafa)] ${borderColor}`}
    >
      <div className="flex h-[48px] w-full min-w-0 items-center gap-[var(--spacing-xs,8px)] px-[var(--spacing-md,16px)] py-[var(--spacing-xs,8px)]">
        <div className="min-w-0 flex-1">
          <CardNumberElement
            options={{ style: CARD_ELEMENT_STYLE, showIcon: true, placeholder: "1234 1234 1234 1234" }}
            onFocus={handleFocus("number")}
            onBlur={handleBlur("number")}
            onChange={handleChange("number")}
          />
        </div>
      </div>
      <div className="h-px w-full bg-[var(--border-subtlest,#eee)]" />
      <div className="flex h-[48px] w-full min-w-0 items-center">
        <div className="min-w-0 flex-1 px-[var(--spacing-md,16px)] py-[var(--spacing-xs,8px)]">
          <CardExpiryElement
            options={{ style: CARD_ELEMENT_STYLE, placeholder: "MM / AA" }}
            onFocus={handleFocus("expiry")}
            onBlur={handleBlur("expiry")}
            onChange={handleChange("expiry")}
          />
        </div>
        <div className="h-[24px] w-px shrink-0 bg-[var(--content-strong,#bdbdbd)]" />
        <div className="flex min-w-0 flex-1 items-center gap-[var(--spacing-xs,8px)] px-[var(--spacing-md,16px)] py-[var(--spacing-xs,8px)]">
          <div className="min-w-0 flex-1">
            <CardCvcElement
              options={{ style: CARD_ELEMENT_STYLE, placeholder: "CVC" }}
              onFocus={handleFocus("cvc")}
              onBlur={handleBlur("cvc")}
              onChange={handleChange("cvc")}
            />
          </div>
          <IdIcon size={20} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
        </div>
      </div>
    </div>
  );
}

function CheckoutFormBody({
  plan,
  email,
  amount,
  errorMsg,
  onError,
  onSuccess,
}: {
  plan: Plan;
  email: string | null;
  amount: { value: number; currency: string };
  errorMsg: string | null;
  onError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const priceLabel = formatPrice(amount.value, amount.currency);

  async function handleSubmit() {
    const cardNumberElement = elements?.getElement(CardNumberElement);
    if (!stripe || !elements || !cardNumberElement) return;

    setSubmitting(true);
    onError(null);

    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
      billing_details: { name, email: email ?? undefined },
    });

    if (pmError || !paymentMethod) {
      onError(pmError?.message ?? "Verifique os dados do cartão");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          name,
          cpf: cpf.replace(/\D/g, ""),
          paymentMethodId: paymentMethod.id,
        }),
      });
      const data = await res.json();
      if (!data.clientSecret) {
        onError(data.error || "Erro ao iniciar o pagamento");
        setSubmitting(false);
        return;
      }

      const { error: confirmError } =
        data.mode === "setup"
          ? await stripe.confirmCardSetup(data.clientSecret)
          : await stripe.confirmCardPayment(data.clientSecret);

      if (confirmError) {
        onError(confirmError.message ?? "Não foi possível confirmar o pagamento");
        setSubmitting(false);
        return;
      }

      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro de rede");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      <OrderSummary plan={plan} priceLabel={priceLabel} />

      <div className="flex w-full items-center gap-[var(--spacing-sm,12px)] font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)]">
        <p className="whitespace-nowrap text-[color:var(--content-strongest,#757575)]">E-mail</p>
        <p className="flex-1 text-right text-[color:var(--content-base,#212121)]">{email ?? "—"}</p>
      </div>

      <div className="flex w-full flex-col items-start gap-[var(--spacing-xxs,4px)]">
        <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
          Dados do cartão
        </p>
        <CardFields />
      </div>

      <p className="w-full font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-strongest,#757575)]">
        Processado com segurança pelo Stripe — seus dados de cartão nunca passam pelo nosso servidor.
      </p>

      <TextField
        label="Nome do titular do cartão"
        name="cardholder-name"
        placeholder="Nome completo"
        icon={<PeopleIcon size={24} />}
        value={name}
        onChange={setName}
      />
      <TextField
        label="CPF"
        name="cardholder-cpf"
        placeholder="Digite o CPF do titular"
        icon={<IdIcon size={24} />}
        value={cpf}
        onChange={(v) => setCpf(maskCPF(v))}
      />

      {errorMsg && (
        <p className="w-full text-center text-[14px] text-[color:var(--feedback-danger-strong,#991515)]">
          {errorMsg}
        </p>
      )}

      <div className="flex w-full flex-col items-start gap-[var(--spacing-md,16px)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!stripe || submitting}
          className="flex h-[56px] w-full items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-large,16px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding,16px)] disabled:opacity-60"
        >
          <span className="whitespace-nowrap font-[family-name:var(--typography-label-large-font-family)] font-[var(--typography-label-large-font-weight,500)] text-[length:var(--typography-label-large-font-size,20px)] leading-[var(--typography-label-large-line-height,24px)] tracking-[var(--typography-label-large-letter-spacing,-0.4px)] text-[color:var(--button-primary-content-enabled,#fafafa)]">
            {submitting ? "Processando..." : `Confirmar assinatura — ${priceLabel}`}
          </span>
        </button>
        <div className="flex w-full items-center justify-center gap-[var(--spacing-xxs,4px)]">
          <LockIcon size={16} className="text-[color:var(--content-strongest,#757575)]" />
          <span className="whitespace-nowrap font-[family-name:var(--typography-label-x-small-font-family)] font-[var(--typography-label-x-small-font-weight,600)] text-[length:var(--typography-label-x-small-font-size,12px)] leading-[var(--typography-label-x-small-line-height,16px)] tracking-[var(--typography-label-x-small-letter-spacing,0.4px)] text-[color:var(--content-strongest,#757575)]">
            Pagamento processado com segurança pela Stripe
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan: Plan = searchParams.get("plan") === "yearly" ? "yearly" : "monthly";

  const [email, setEmail] = useState<string | null>(null);
  const [amount, setAmount] = useState<{ value: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAmount({
          value: plan === "monthly" ? data.monthly : data.yearly,
          currency: data.currency,
        });
      })
      .catch(() => setErrorMsg("Não foi possível carregar o valor da assinatura"))
      .finally(() => setLoading(false));
  }, [plan]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Checkout" href="/pricing" />

      {loading || !amount ? (
        <p className="w-full py-10 text-center text-[14px] text-[color:var(--content-strongest,#757575)]">
          {errorMsg ?? "Carregando..."}
        </p>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutFormBody
            plan={plan}
            email={email}
            amount={amount}
            errorMsg={errorMsg}
            onError={setErrorMsg}
            onSuccess={() => router.push("/success")}
          />
        </Elements>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
