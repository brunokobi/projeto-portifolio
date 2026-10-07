// Text-to-Speech usando Web Speech API (gratuito, nativo do browser)

interface SpeechOptions {
  text: string;
  language: string; // pt-BR, en-US, es-ES, fr-FR, etc
  rate?: number; // 0.5 - 2.0 (padrão 1)
  pitch?: number; // 0.5 - 2.0 (padrão 1)
  volume?: number; // 0 - 1 (padrão 1)
}

export function speak(options: SpeechOptions): void {
  const { text, language, rate = 1, pitch = 1, volume = 1 } = options;

  // Cancela fala anterior se estiver rodando
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

export function getAvailableLanguages(): { code: string; name: string }[] {
  return [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'pt-PT', name: 'Português (Portugal)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文 (简体)' },
  ];
}
