"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CreditCardX, ChevronRight, BadgeCheck } from "lucide-react";
import { AlertIcon } from "@/components/icons";
import { getPushSubscriptionState, subscribeToPush } from "@/lib/push/client";
import type { DisclaimerTone, ServerDisclaimerTone } from "@/lib/disclaimer";

const EVER_OPENED_KEY = "lumo:ever-opened-dashboard";
const RETURNING_SESSION_KEY = "lumo:returning-session";

// "Lumo Pro" não pode aparecer na mesma visita em que o usuário ativou as
// notificações (pareceria que é o mesmo card mudando de conteúdo). sessionStorage
// marca a decisão uma vez por sessão de navegador (sobrevive a reloads, mas
// não a fechar a aba/app); localStorage lembra se já houve alguma sessão
// anterior neste dispositivo.
function getIsReturningSession() {
  try {
    const cached = sessionStorage.getItem(RETURNING_SESSION_KEY);
    if (cached !== null) return cached === "1";

    const everOpenedBefore = localStorage.getItem(EVER_OPENED_KEY) === "1";
    sessionStorage.setItem(RETURNING_SESSION_KEY, everOpenedBefore ? "1" : "0");
    localStorage.setItem(EVER_OPENED_KEY, "1");
    return everOpenedBefore;
  } catch {
    return false;
  }
}

const CONTENT: Record<ServerDisclaimerTone, { title: string; description: (clientCount: number) => string }> = {
  "lumo-pro": {
    title: "Conheça o Lumo Pro",
    description: () => "Clientes ilimitados, agenda sem limite de sessões, suporte dedicado e muito mais.",
  },
  "two-days": {
    title: "Continue com tudo liberado",
    description: () =>
      "Faltam 2 dias do seu teste gratuito. Assine e mantenha clientes ilimitados e notificações automáticas.",
  },
  "last-day": {
    title: "Último dia do seu teste",
    description: () => "Assine agora e siga com acesso completo ao Lumo Pro.",
  },
  growth: {
    title: "Seu negócio está crescendo",
    description: (clientCount) =>
      `Você já tem ${clientCount} ${clientCount === 1 ? "cliente cadastrado" : "clientes cadastrados"}. Assine o Pro e continue crescendo sem limites.`,
  },
  "client-limit": {
    title: "Seu negócio está crescendo",
    description: () => "Você não pode mais cadastrar clientes. Assine o Pro e continue crescendo sem limites.",
  },
  "payment-failed": {
    title: "Atualize sua forma de pagamento",
    description: () =>
      "O processamento do pagamento falhou. Atualize seus dados pra continuar com o Lumo Pro sem interrupções.",
  },
};

const ICONS: Record<ServerDisclaimerTone, React.ComponentType<{ size?: number; className?: string }>> = {
  "lumo-pro": BadgeCheck,
  "two-days": BadgeCheck,
  "last-day": AlertIcon,
  growth: AlertIcon,
  "client-limit": AlertIcon,
  "payment-failed": CreditCardX,
};

function DisclaimerTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="w-full font-[family-name:var(--typography-label-small-font-family)] font-[var(--typography-label-small-font-weight,600)] text-[length:var(--typography-label-small-font-size,16px)] leading-[var(--typography-label-small-line-height,24px)] tracking-[var(--typography-label-small-letter-spacing,0px)] text-[color:var(--content-base,#212121)]">
      {children}
    </p>
  );
}

function DisclaimerDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="w-full font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
      {children}
    </p>
  );
}

function NotificationDisclaimer({
  subscribing,
  onEnable,
}: {
  subscribing: boolean;
  onEnable: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
      <CreditCard size={24} className="shrink-0 text-[color:var(--content-base,#212121)]" />
      <div className="flex flex-1 flex-col items-start">
        <DisclaimerTitle>Ative as notificações</DisclaimerTitle>
        <DisclaimerDescription>Receba alertas de confirmações e de próximas reuniões.</DisclaimerDescription>
      </div>
      <button
        type="button"
        onClick={onEnable}
        disabled={subscribing}
        className="flex h-[40px] shrink-0 items-center justify-center gap-[var(--button-gap,8px)] rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding-small,12px)] disabled:opacity-60"
      >
        <span className="font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,18px)] leading-[var(--typography-label-medium-line-height,24px)] tracking-[var(--typography-label-medium-letter-spacing,0px)] text-[color:var(--button-primary-content-enabled,#fafafa)]">
          {subscribing ? "Ativando..." : "Ativar"}
        </span>
      </button>
    </div>
  );
}

export default function Disclaimer({
  serverTone,
  clientCount,
}: {
  serverTone: ServerDisclaimerTone | null;
  clientCount: number;
}) {
  const router = useRouter();
  const [pushState, setPushState] = useState<"loading" | "unsupported" | "denied" | "unsubscribed" | "subscribed">(
    "loading"
  );
  const [subscribing, setSubscribing] = useState(false);
  const [isReturningSession, setIsReturningSession] = useState(false);

  useEffect(() => {
    getPushSubscriptionState().then(setPushState);
    queueMicrotask(() => setIsReturningSession(getIsReturningSession()));
  }, []);

  async function handleEnable() {
    setSubscribing(true);
    try {
      await subscribeToPush();
      setPushState("subscribed");
    } catch (err) {
      console.error("[push] Falha ao ativar notificações:", err);
      setPushState(await getPushSubscriptionState());
    } finally {
      setSubscribing(false);
    }
  }

  let tone: DisclaimerTone | null;
  if (pushState === "unsubscribed") {
    tone = "notification";
  } else if (serverTone === "lumo-pro" && !isReturningSession) {
    tone = null;
  } else {
    tone = serverTone;
  }

  if (!tone) return null;

  if (tone === "notification") {
    return <NotificationDisclaimer subscribing={subscribing} onEnable={handleEnable} />;
  }

  const content = CONTENT[tone];
  const Icon = ICONS[tone];

  return (
    <button
      type="button"
      onClick={() => router.push("/pricing")}
      className="flex w-full items-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)] text-left"
    >
      <Icon size={24} className="shrink-0 text-[color:var(--content-base,#212121)]" />
      <div className="flex flex-1 flex-col items-start">
        <DisclaimerTitle>{content.title}</DisclaimerTitle>
        <DisclaimerDescription>{content.description(clientCount)}</DisclaimerDescription>
      </div>
      <ChevronRight size={24} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
    </button>
  );
}
