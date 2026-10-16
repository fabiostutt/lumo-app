// Configuração central do paywall do Lumo Pro — gatilhos, flags e textos.
// Módulo puro: sem imports de servidor/cliente, pra poder ser usado dos dois
// lados (o Provider client-side e as Server Actions).

import type { Vocabulary } from "@/lib/vocabulary";

export type ProFeature = "client_limit" | "whatsapp_automation" | "google_calendar";

// Quando a flag está false, nenhum paywall aparece pra esse gatilho — o
// comportamento atual continua exatamente como está.
export const FEATURE_LIVE: Record<ProFeature, boolean> = {
  client_limit: true,
  // Meta ainda não verificou a conta de negócios do WhatsApp — a automação
  // de confirmação/lembrete não está disponível pra ninguém ainda.
  whatsapp_automation: false,
  // App ainda não publicado no Google — a integração com Google Agenda
  // não está disponível pra ninguém ainda.
  google_calendar: false,
};

export type ProPaywallMeta = {
  count?: number;
};

export type ProPaywallCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function getPaywallCopy(
  feature: ProFeature,
  vocab: Vocabulary,
  meta?: ProPaywallMeta
): ProPaywallCopy {
  switch (feature) {
    case "client_limit":
      return {
        eyebrow: `Você já tem ${meta?.count ?? 0} ${vocab.person(meta?.count)}`,
        title: "Continue crescendo com o Lumo Pro",
        subtitle: `Cadastre quem você atende, sem limite, e mantenha toda a sua agenda num só lugar.`,
      };
    case "whatsapp_automation":
      return {
        eyebrow: "Confirmação e lembrete automáticos",
        title: "Deixe o Lumo avisar por você",
        subtitle:
          "Mensagens de confirmação e lembrete saem sozinhas pelo WhatsApp, e a resposta já atualiza a sua agenda.",
      };
    case "google_calendar":
      return {
        eyebrow: `Link automático de ${vocab.event()}`,
        title: "Sua agenda conectada ao Google Agenda",
        subtitle: `Cada ${vocab.event()} marcada no Lumo vira um evento no Google Agenda, com o link da chamada gerado automaticamente.`,
      };
  }
}

// feature: null = benefício genérico, não amarrado a uma feature específica
// (nunca omitido por FEATURE_LIVE).
type CheckItem = { feature: ProFeature | null; label: string };

function getAllChecks(vocab: Vocabulary): CheckItem[] {
  return [
    { feature: "client_limit", label: `Sem limite de ${vocab.person(2)}` },
    { feature: "whatsapp_automation", label: "Confirmação automática por WhatsApp" },
    { feature: "whatsapp_automation", label: `Lembretes automáticos de ${vocab.event()}` },
    { feature: "google_calendar", label: "Integração com o Google Agenda" },
    { feature: null, label: "Suporte prioritário" },
  ];
}

const MAX_CHECKS = 4;

// Lista de benefícios do sheet: o item do próprio gatilho vem primeiro, o
// resto segue a ordem fixa, no máximo 4 (corta do final), e nunca mostra um
// item cuja feature está desligada em FEATURE_LIVE.
export function getPaywallChecks(feature: ProFeature, vocab: Vocabulary): string[] {
  const all = getAllChecks(vocab).filter((item) => item.feature === null || FEATURE_LIVE[item.feature]);

  const triggerItems = all.filter((item) => item.feature === feature);
  const restItems = all.filter((item) => item.feature !== feature);

  return [...triggerItems, ...restItems].slice(0, MAX_CHECKS).map((item) => item.label);
}
