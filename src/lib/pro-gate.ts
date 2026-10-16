// Configuração central do paywall do Lumo Pro — gatilhos, flags e textos.
// Módulo puro: sem imports de servidor/cliente, pra poder ser usado dos dois
// lados (o Provider client-side e as Server Actions).

import type { Vocabulary } from "@/lib/vocabulary";

export type ProFeature =
  | "client_limit"
  | "recurrence"
  | "whatsapp_share"
  | "whatsapp_automation"
  | "google_calendar";

// Quando a flag está false, nenhum paywall aparece pra esse gatilho — o
// comportamento atual continua exatamente como está.
export const FEATURE_LIVE: Record<ProFeature, boolean> = {
  client_limit: true,
  // A recorrência já existe no app (ScheduleSessionForm + create-session) —
  // só falta o gate pro Free.
  recurrence: true,
  // Ainda não existe a ação de enviar os detalhes da sessão pelo WhatsApp —
  // trocar para true no commit que a entregar.
  whatsapp_share: false,
  // Meta ainda não verificou a conta de negócios do WhatsApp — a automação
  // de confirmação/lembrete não está disponível pra ninguém ainda.
  whatsapp_automation: false,
  // App ainda não publicado no Google — a integração com Google Agenda
  // não está disponível pra ninguém ainda.
  google_calendar: false,
};

// Quando true, a lista de checks também mostra itens de recursos desligados
// em FEATURE_LIVE (prévia do que está por vir). Hoje false — só mostra o que
// já está disponível pra assinar.
export const SHOW_UPCOMING_CHECKS = false;

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
        subtitle: "Cadastre quem você atende, sem limite, e mantenha toda a sua agenda num só lugar.",
      };
    case "recurrence":
      return {
        eyebrow: "Agenda recorrente",
        title: "Agende uma vez e o Lumo repete",
        subtitle: `Crie ${vocab.event(2)} semanais, quinzenais ou mensais de uma só vez, sem marcar uma por uma.`,
      };
    case "whatsapp_share":
      return {
        eyebrow: "Envio pelo WhatsApp",
        title: "Envie direto para o chat, sem procurar o contato",
        subtitle: `O Lumo abre a conversa certa com a mensagem pronta, com data, horário e ${vocab.event()}. Você só toca em enviar.`,
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

type CheckItem = { feature: ProFeature; label: string };

// Lista mestra, ordem fixa — getChecks só filtra e reordena a partir daqui,
// nunca muda a ordem relativa entre itens que não são o gatilho.
function getMasterChecks(vocab: Vocabulary): CheckItem[] {
  return [
    { feature: "client_limit", label: `Sem limite de ${vocab.person(2)}` },
    { feature: "whatsapp_share", label: "Envio direto pelo WhatsApp" },
    { feature: "whatsapp_automation", label: "Confirmação automática por WhatsApp" },
    { feature: "whatsapp_automation", label: `Lembretes automáticos de ${vocab.event()}` },
    { feature: "recurrence", label: `${vocab.Event(2)} recorrentes` },
    { feature: "google_calendar", label: "Integração com o Google Agenda" },
  ];
}

const MAX_CHECKS = 4;

// Benefícios do sheet pro gatilho `feature`: parte da lista mestra, remove
// os itens de recursos desligados (a não ser que SHOW_UPCOMING_CHECKS seja
// true), sobe pro início todos os itens do próprio gatilho (preservando a
// ordem relativa entre eles) e mostra os 4 primeiros. Nunca inclui "Suporte
// prioritário" (não faz parte da lista mestra).
export function getChecks(feature: ProFeature, vocab: Vocabulary): string[] {
  const all = getMasterChecks(vocab).filter(
    (item) => SHOW_UPCOMING_CHECKS || FEATURE_LIVE[item.feature]
  );

  const triggerItems = all.filter((item) => item.feature === feature);
  const restItems = all.filter((item) => item.feature !== feature);

  return [...triggerItems, ...restItems].slice(0, MAX_CHECKS).map((item) => item.label);
}
