import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Router from "./routes";
import { IntlProvider } from "react-intl";
import VisitCounter from "./components/Contador/VisitCounter";
import WeatherBar from "./components/WeatherBar";
import { useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-relativetimeformat/locale-data/es";
import "@formatjs/intl-relativetimeformat/locale-data/pt";
import "@formatjs/intl-relativetimeformat/locale-data/fr";
import "@formatjs/intl-relativetimeformat/locale-data/de";
import "@formatjs/intl-relativetimeformat/locale-data/zh";
import "@formatjs/intl-relativetimeformat/locale-data/ru";
import "@formatjs/intl-relativetimeformat/locale-data/kl";
import "@formatjs/intl-relativetimeformat/locale-data/ar";

import enMessages from "../src/i18n/messages/en.json";
import esMessages from "../src/i18n/messages/es.json";
import ptMessages from "../src/i18n/messages/pt.json";
import frMessages from "../src/i18n/messages/fr.json";
import deMessages from "../src/i18n/messages/de.json";
import zhMessages from "../src/i18n/messages/zh.json";
import ruMessages from "../src/i18n/messages/ru.json";
import klMessages from "../src/i18n/messages/kl.json";
import arMessages from "../src/i18n/messages/ar.json";

const allMessages: Record<string, Record<string, string>> = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  fr: frMessages,
  de: deMessages,
  zh: zhMessages,
  ru: ruMessages,
  kl: klMessages,
  ar: arMessages,
};

function AppContent() {
  const { locale } = useLanguage();
  const messages = allMessages[locale] || allMessages.pt;
  const { pathname } = useLocation();
  const isNews = pathname.startsWith("/news");

  return (
    <>
      <IntlProvider locale={locale} messages={messages}>
        {!isNews && <WeatherBar />}
        {!isNews && <VisitCounter />}
        <Router />
        <ToastContainer />
      </IntlProvider>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;