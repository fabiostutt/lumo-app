"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getPushSubscriptionState, subscribeToPush } from "@/lib/push/client";

export default function PushNotificationsPrompt() {
  const [state, setState] = useState<"loading" | "unsupported" | "denied" | "unsubscribed" | "subscribed">(
    "loading"
  );
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    getPushSubscriptionState().then(setState);
  }, []);

  async function handleEnable() {
    setSubscribing(true);
    try {
      await subscribeToPush();
      setState("subscribed");
    } catch (err) {
      console.error("[push] Falha ao ativar notificações:", err);
      setState(await getPushSubscriptionState());
    } finally {
      setSubscribing(false);
    }
  }

  if (state !== "unsubscribed") return null;

  return (
    <div className="flex w-full items-center gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
      <Bell size={24} className="shrink-0 text-[color:var(--content-base,#212121)]" />
      <p className="flex-1 font-[family-name:var(--typography-body-small-font-family)] font-[var(--typography-body-small-font-weight,400)] text-[length:var(--typography-body-small-font-size,14px)] leading-[var(--typography-body-small-line-height,20px)] tracking-[var(--typography-body-small-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
        Ative notificações para saber quando uma sessão for confirmada ou estiver prestes a começar.
      </p>
      <button
        type="button"
        onClick={handleEnable}
        disabled={subscribing}
        className="shrink-0 rounded-[var(--button-border-radius-small,8px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding-small,12px)] py-[var(--spacing-xs,8px)] font-[family-name:var(--typography-label-medium-font-family)] font-[var(--typography-label-medium-font-weight,600)] text-[length:var(--typography-label-medium-font-size,14px)] text-[color:var(--button-primary-content-enabled,#fafafa)] disabled:opacity-60"
      >
        {subscribing ? "Ativando..." : "Ativar"}
      </button>
    </div>
  );
}
