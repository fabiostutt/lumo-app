import { cache } from "react";
import { getOrCreateProfile, getGateState, type GateState } from "@/lib/plan";

// getOrCreateProfile já é cache()-deduplicado por request — reaproveita o
// resultado se o layout/página já chamou ele antes na mesma renderização.
export const getGateStateForCurrentUser = cache(async (): Promise<GateState> => {
  try {
    const profile = await getOrCreateProfile();
    return getGateState(profile);
  } catch {
    // Sem usuário autenticado (login, /privacidade, /termos, etc) — nunca
    // mostra paywall nessas páginas.
    return "pro";
  }
});
