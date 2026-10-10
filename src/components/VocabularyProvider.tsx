"use client";

import { createContext, useContext, useMemo } from "react";
import { getVocabulary, type Vocabulary } from "@/lib/vocabulary";

const VocabularyContext = createContext<Vocabulary | null>(null);

export function VocabularyProvider({
  area,
  children,
}: {
  area: string | null;
  children: React.ReactNode;
}) {
  // getVocabulary é puro — reconstruir aqui (em vez de receber o objeto do
  // servidor) porque funções não atravessam o limite Server -> Client; só a
  // string de `area` precisa viajar.
  const vocabulary = useMemo(() => getVocabulary(area), [area]);

  return <VocabularyContext.Provider value={vocabulary}>{children}</VocabularyContext.Provider>;
}

export function useVocabulary(): Vocabulary {
  const vocabulary = useContext(VocabularyContext);
  // Fallback de segurança — nunca deveria faltar o Provider já que ele está
  // no layout raiz, mas evita quebrar em vez de lançar.
  return vocabulary ?? getVocabulary(null);
}
