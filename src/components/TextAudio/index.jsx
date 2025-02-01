const falar = (text) => {
  const synth = window.speechSynthesis;
  const som = localStorage.getItem("Audio"); // Obtém o estado do áudio: "on" ou "off"
  const i18nConfig = JSON.parse(localStorage.getItem("i18nConfig") || "{}");
  const selectedLang = i18nConfig.selectedLang || "pt"; // Padrão: "pt"

  if (!text) return;

  // Ajuste de pronúncia para palavras específicas
  const pronunciationAdjustments = {
    Github: "Git Hub",
  };
  
  text = pronunciationAdjustments[text] || text;

  // Mapeamento de idiomas suportados
  const langMap = {
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
