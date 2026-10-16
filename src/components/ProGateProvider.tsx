"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ProPaywallSheet from "@/components/ProPaywallSheet";
import type { GateState } from "@/lib/plan";
import type { ProFeature, ProPaywallMeta } from "@/lib/pro-gate";

type ProGateContextValue = {
  gateState: GateState;
  openPaywall: (feature: ProFeature, meta?: ProPaywallMeta) => void;
};

const ProGateContext = createContext<ProGateContextValue | null>(null);

export function ProGateProvider({
  gateState,
  children,
}: {
  gateState: GateState;
  children: React.ReactNode;
}) {
  const [sheet, setSheet] = useState<{ feature: ProFeature; meta?: ProPaywallMeta } | null>(null);

  const openPaywall = useCallback(
    (feature: ProFeature, meta?: ProPaywallMeta) => {
      // Só mostra pra usuários Free de verdade — trial vigente ou
      // assinatura ativa/trialing nunca veem o paywall, e payment_issue tem
      // seu próprio componente (fora deste escopo).
      if (gateState !== "free") return;
      setSheet({ feature, meta });
    },
    [gateState]
  );

  const handleClose = useCallback(() => setSheet(null), []);

  const value = useMemo(() => ({ gateState, openPaywall }), [gateState, openPaywall]);

  return (
    <ProGateContext.Provider value={value}>
      {children}
      {sheet && (
        <ProPaywallSheet
          feature={sheet.feature}
          meta={sheet.meta}
          open={!!sheet}
          onClose={handleClose}
        />
      )}
    </ProGateContext.Provider>
  );
}

export function useProGate(): ProGateContextValue {
  const ctx = useContext(ProGateContext);
  // Fallback de segurança — nunca deveria faltar o Provider já que ele está
  // no layout raiz, mas evita quebrar em vez de lançar.
  return ctx ?? { gateState: "pro", openPaywall: () => {} };
}
