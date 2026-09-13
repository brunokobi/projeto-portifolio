import { createContext, useContext } from "react";
import type { LanguageContextType } from "../types";

// Contexto + hook isolados num arquivo à parte (sem componentes) pra
// LanguageContext.tsx poder exportar só o LanguageProvider — um arquivo que
// mistura componente e valores não-componente quebra o Fast Refresh.
export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
