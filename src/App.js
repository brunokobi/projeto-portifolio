// Importa o ToastContainer para exibir notificações
import { ToastContainer } from "react-toastify";
// Importa os estilos padrão do react-toastify
import "react-toastify/dist/ReactToastify.css";
// Importa o componente de rotas da aplicação
import Router from "./routes";
// Importa o IntlProvider para suporte a internacionalização
import { IntlProvider } from "react-intl";

// Importa polyfills e dados de idioma para suporte a formatação de tempo relativo
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

// Importa os arquivos de mensagens traduzidas para diferentes idiomas
import enMessages from "../src/i18n/messages/en.json";
import esMessages from "../src/i18n/messages/es.json";
import ptMessages from "../src/i18n/messages/pt.json";
import frMessages from "../src/i18n/messages/fr.json";
import deMessages from "../src/i18n/messages/de.json";
import zhMessages from "../src/i18n/messages/zh.json";
import ruMessages from "../src/i18n/messages/ru.json";
import klMessages from "../src/i18n/messages/kl.json";
import arMessages from "../src/i18n/messages/ar.json";

// Agrupa todas as mensagens por idioma
const allMessages = {
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

// Chave usada no localStorage para armazenar a configuração de idioma
const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || "i18nConfig";

// Estado inicial com idioma padrão
const initialState = {
  selectedLang: "pt", // Idioma padrão definido como português
};

// Função para obter a configuração de idioma do localStorage
function getConfig() {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  if (ls) {
    try {
      return JSON.parse(ls); // Tenta converter os dados armazenados em JSON
    } catch (er) {
      console.error(er); // Exibe erros no console se houver falha na conversão
    }
  }
  return initialState; // Retorna o estado inicial se nenhuma configuração for encontrada
}

// Função para alterar o idioma selecionado
export function setLanguage(lang) {
  // Salva o idioma selecionado no localStorage
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: lang }));
  // Recarrega a página para aplicar as mudanças
  window.location.reload();
}

// Componente principal da aplicação
function App() {
  // Obtém a configuração de idioma do localStorage
  const lang = getConfig();
  let locale = "pt"; // Define o idioma padrão como português
  if (lang) {
    locale = lang.selectedLang; // Atualiza o idioma se configurado
  }
  const messages = allMessages[locale]; // Obtém as mensagens traduzidas para o idioma selecionado

  return (
    <> 
      {/* Provedor de internacionalização */}
      <IntlProvider locale={locale} messages={messages}> 
        {/* Gerencia as rotas da aplicação */}
        <Router /> 
        {/* Exibe as notificações toast */}
        <ToastContainer /> 
      </IntlProvider> 
    </>
  );
}

export default App;
