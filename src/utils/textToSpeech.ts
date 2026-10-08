// Text-to-Speech usando Web Speech API (gratuito, nativo do browser)

interface SpeechOptions {
  text: string;
  language: string; // pt-BR, en-US, es-ES, fr-FR, etc
  rate?: number; // 0.5 - 2.0 (padrão 1)
  pitch?: number; // 0.5 - 2.0 (padrão 1)
  volume?: number; // 0 - 1 (padrão 1)
}

// Nomes que indicam voz de qualidade melhor (nem toda engine marca isso da
// mesma forma): Chrome expõe vozes "Google" (nuvem, soam bem mais naturais
// que o sintetizador local do SO); Edge/Windows têm variantes "Natural" ou
// "Online (Natural)"; macOS/iOS têm vozes "Enhanced"/"Premium". Sem
// selecionar explicitamente, o navegador usa a primeira voz instalada pro
// idioma — geralmente a pior (sintetizador local clássico, robótico).
const INDICADORES_VOZ_BOA = ["google", "natural", "enhanced", "premium", "neural"];

let vozesCache: SpeechSynthesisVoice[] = [];

function carregarVozes(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const vozes = window.speechSynthesis.getVoices();
    if (vozes.length > 0) {
      resolve(vozes);
      return;
    }
    // Chrome carrega a lista de vozes de forma assíncrona — na primeira
    // chamada da página, getVoices() costuma vir vazio até o evento disparar.
    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

function escolherMelhorVoz(vozes: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
  const idiomaBase = language.split("-")[0].toLowerCase();
  const candidatas = vozes.filter(
    (v) => v.lang.toLowerCase() === language.toLowerCase() || v.lang.toLowerCase().startsWith(idiomaBase)
  );
  if (candidatas.length === 0) return null;

  // Prioriza match exato de idioma (pt-BR antes de pt-PT quando pedimos
  // pt-BR), e dentro disso prioriza nome com indicador de voz melhor.
  const exatas = candidatas.filter((v) => v.lang.toLowerCase() === language.toLowerCase());
  const pool = exatas.length > 0 ? exatas : candidatas;

  const boa = pool.find((v) => INDICADORES_VOZ_BOA.some((ind) => v.name.toLowerCase().includes(ind)));
  return boa ?? pool[0];
}

export async function speak(options: SpeechOptions): Promise<void> {
  const { text, language, rate = 1, pitch = 1, volume = 1 } = options;

  // Cancela fala anterior se estiver rodando
  window.speechSynthesis.cancel();

  if (vozesCache.length === 0) {
    vozesCache = await carregarVozes();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const melhorVoz = escolherMelhorVoz(vozesCache, language);
  if (melhorVoz) {
    utterance.voice = melhorVoz;
  }

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
