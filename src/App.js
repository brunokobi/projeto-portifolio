import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Router from "./routes";
import {IntlProvider} from 'react-intl'

import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-relativetimeformat/locale-data/es";
import "@formatjs/intl-relativetimeformat/locale-data/pt";
import "@formatjs/intl-relativetimeformat/locale-data/fr";
import "@formatjs/intl-relativetimeformat/locale-data/de";
import "@formatjs/intl-relativetimeformat/locale-data/zh";

import enMessages from "../src/i18n/messages/en.json";
import esMessages from "../src/i18n/messages/es.json";
import ptMessages from "../src/i18n/messages/pt.json";
import frMessages from "../src/i18n/messages/fr.json";
import deMessages from "../src/i18n/messages/de.json";
import zhMessages from "../src/i18n/messages/zh.json";

const allMessages = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  fr: frMessages,
  de: deMessages,
  zh: zhMessages,
};

const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || "i18nConfig";

const initialState = {
  selectedLang: "pt",
};

function getConfig() {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  if (ls) {
    try {
      return JSON.parse(ls);
    } catch (er) {
      console.error(er);
    }
  }
  return initialState;
}

// Side effect
export function setLanguage(lang) {
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: lang }));
  window.location.reload();
}





function App() {
  const lang = getConfig();  
  const locale = lang.selectedLang;
  const messages = allMessages[locale];
  return (
    <> 
     <IntlProvider locale={locale} messages={messages}>   
        <Router />;
        <ToastContainer />  
      </IntlProvider>, 
    </>
  );
}

export default App;
