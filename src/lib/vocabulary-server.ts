import { cache } from "react";
import { getOrCreateProfile } from "@/lib/plan";
import { getVocabulary, type Vocabulary } from "@/lib/vocabulary";

// getOrCreateProfile já é cache()-deduplicado por request — chamar aqui não
// adiciona uma query nova se alguma página/layout já chamou ele antes na
// mesma renderização, só reaproveita o resultado memoizado.
export const getVocabularyForCurrentUser = cache(async (): Promise<Vocabulary> => {
  try {
    const profile = await getOrCreateProfile();
    return getVocabulary(profile.area);
  } catch {
    // Sem usuário autenticado (login, /privacidade, /termos, etc) — padrão.
    return getVocabulary(null);
  }
});

export const getAreaForCurrentUser = cache(async (): Promise<string | null> => {
  try {
    const profile = await getOrCreateProfile();
    return profile.area;
  } catch {
    return null;
  }
});
