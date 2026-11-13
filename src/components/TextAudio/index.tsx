import { piperLang, playPiper, stopPiper } from "../../utils/piperTts";

const pronunciationAdjustments: Record<string, string> = {
  Github: "Git Hub",
};

const langMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  zh: "zh-CN",
  ar: "ar",
};

const PIPER_SPEED = 1;
const BROWSER_RATE = 0.8;

function speakWithBrowser(text: string, lang: string): void {
  const word = new SpeechSynthesisUtterance(pronunciationAdjustments[text] || text);
  word.lang = langMap[lang] || "pt-BR";
  word.rate = BROWSER_RATE;
  window.speechSynthesis.speak(word);
}

// Lê em voz alta o texto do elemento sob o mouse, no idioma escolhido no site.
// Usa a voz do Piper quando o idioma tem voz lá; senão, a do navegador.
const falar = (text: string): void => {
  if (!text) return;

  stopPiper();
  window.speechSynthesis.cancel();
  if (localStorage.getItem("Audio") !== "on") return;

  let lang = "pt";
  try {
    lang = JSON.parse(localStorage.getItem("i18nConfig") || "{}").selectedLang || "pt";
  } catch {
    // config corrompida: fica em português
  }

  if (piperLang(lang)) {
    playPiper(text, lang, PIPER_SPEED).catch(() => speakWithBrowser(text, lang));
    return;
  }
  speakWithBrowser(text, lang);
};

export default falar;
