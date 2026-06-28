import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { LanguageContextType } from "../types";

const LANG_KEY = "i18nConfig";

const getStoredLang = (): string => {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return stored ? JSON.parse(stored).selectedLang : "pt";
  } catch {
    return "pt";
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<string>(getStoredLang);

  const setLanguage = useCallback((lang: string) => {
    localStorage.setItem(LANG_KEY, JSON.stringify({ selectedLang: lang }));
    setLocale(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLanguage }}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
