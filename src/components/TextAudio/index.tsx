const falar = (text: string): void => {
  const synth = window.speechSynthesis;
  const som = localStorage.getItem("Audio");
  const i18nConfig = JSON.parse(localStorage.getItem("i18nConfig") || "{}");
  const selectedLang: string = i18nConfig.selectedLang || "pt";

  if (!text) return;

  const pronunciationAdjustments: Record<string, string> = {
    Github: "Git Hub",
  };

  text = pronunciationAdjustments[text] || text;

  const langMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
    de: "de-DE",
    ru: "ru-RU",
    zh: "zh-CN",
  };

  // Cria a instância para síntese de fala
  const word = new SpeechSynthesisUtterance(text);
  word.lang = langMap[selectedLang] || "pt-BR";
  word.rate = 0.8;

  synth.cancel(); // Cancela qualquer fala em andamento

  if (som === "on") {
    synth.speak(word);
  }
};

export default falar;
