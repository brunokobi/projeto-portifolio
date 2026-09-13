import { useState, useCallback, type ReactNode } from "react";
import { LanguageContext } from "./useLanguage";

const LANG_KEY = "i18nConfig";

const getStoredLang = (): string => {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return stored ? JSON.parse(stored).selectedLang : "pt";
  } catch {
    return "pt";
  }
};

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
