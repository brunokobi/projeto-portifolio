import { createContext, useContext, useState, useCallback } from "react";

const LANG_KEY = "i18nConfig";

const getStoredLang = () => {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return stored ? JSON.parse(stored).selectedLang : "pt";
  } catch {
    return "pt";
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(getStoredLang);

  const setLanguage = useCallback((lang) => {
    localStorage.setItem(LANG_KEY, JSON.stringify({ selectedLang: lang }));
    setLocale(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
