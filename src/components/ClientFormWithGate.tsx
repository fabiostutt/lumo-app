"use client";

import { useEffect } from "react";
import ClientForm from "@/components/ClientForm";
import { useProGate } from "@/components/ProGateProvider";

// Abrir /clients/new já é a tentativa de ação, então mostra o paywall
// automaticamente ao montar quando o servidor já sabe que está bloqueado —
// a exceção explícita à regra de "só em resposta a uma ação" (ver seção 3
// das regras de exibição do paywall).
export default function ClientFormWithGate({
  returnTo,
  openOnMount,
  clientCount,
}: {
  returnTo?: string;
  openOnMount: boolean;
  clientCount: number;
}) {
  const { openPaywall } = useProGate();

  useEffect(() => {
    if (openOnMount) {
      openPaywall("client_limit", { count: clientCount });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ClientForm returnTo={returnTo} />;
}
