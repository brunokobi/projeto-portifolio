// Voz neural (Piper) servida pela VPS em tts.brunokobi.tech. Quem chama cai para
// a voz do navegador quando o idioma não tem voz no Piper ou o serviço falha.
export const PIPER_TTS_URL = "https://tts.brunokobi.tech/tts.mp3";

const PIPER_LANGS = new Set(["pt", "en", "es", "fr", "de", "ru", "ar"]);
const MAX_CHUNK_CHARS = 400;
// Na VPS cada 100 caracteres levam ~1,5s: o primeiro trecho curto faz a fala começar logo.
const FIRST_CHUNK_CHARS = 120;

const PRONUNCIATION: Record<string, [RegExp, string][]> = {
  pt: [[/\bJARVIS\b/gi, "Járvis"], [/\bGithub\b/gi, "Git Hub"], [/\bKobi\b/gi, "Cóbi"], [/\bVennx\b/gi, "Vénix"]],
  en: [[/\bGithub\b/gi, "Git Hub"]],
};

export function piperLang(language: string): string | null {
  const base = language.split("-")[0].toLowerCase();
  return PIPER_LANGS.has(base) ? base : null;
}

export function prepareText(text: string, lang: string): string {
  let clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of PRONUNCIATION[lang] ?? []) {
    clean = clean.replace(pattern, replacement);
  }
  return clean;
}

// Frases curtas começam a tocar antes e não passam do limite do servidor.
export function splitIntoChunks(text: string, maxChars = MAX_CHUNK_CHARS, firstMaxChars = maxChars): string[] {
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const limit = () => (chunks.length === 0 ? firstMaxChars : maxChars);
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (current && current.length + sentence.length + 1 > limit()) {
      chunks.push(current);
      current = "";
    }
    if (current) {
      current = `${current} ${sentence}`;
      continue;
    }
    let rest = sentence;
    while (rest.length > limit()) {
      const size = limit();
      const space = rest.lastIndexOf(" ", size);
      const cut = space > size / 2 ? space : size;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    current = rest;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function buildPiperUrl(text: string, lang: string, speed: number): string {
  const params = new URLSearchParams({ text, lang, speed: (Math.round(speed * 10) / 10).toFixed(1) });
  return `${PIPER_TTS_URL}?${params.toString()}`;
}

let playbackId = 0;
let currentAudio: HTMLAudioElement | null = null;
let releaseCurrent: (() => void) | null = null;

export function stopPiper(): void {
  playbackId++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeAttribute("src");
    currentAudio = null;
  }
  // Áudio pausado não dispara "ended": libera quem estava esperando por ele.
  releaseCurrent?.();
  releaseCurrent = null;
}

function playOne(url: string, id: number, next?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (id !== playbackId) return resolve();
    const audio = new Audio(url);
    currentAudio = audio;
    releaseCurrent = () => resolve();
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("piper: falha ao carregar o áudio"));
    audio.play().then(
      () => {
        if (next) new Audio(next).preload = "auto";
      },
      (err: unknown) => reject(err instanceof Error ? err : new Error(String(err)))
    );
  });
}

/**
 * Fala o texto com o Piper. Resolve com "done" ao terminar, "stopped" se outra
 * fala começou no meio, e rejeita se nada chegou a tocar (para o chamador usar
 * a voz do navegador). Erro depois de começar só encerra a fala.
 */
export async function playPiper(text: string, language: string, speed: number): Promise<"done" | "stopped"> {
  const lang = piperLang(language);
  if (!lang) throw new Error(`piper: idioma sem voz (${language})`);
  const chunks = splitIntoChunks(prepareText(text, lang), MAX_CHUNK_CHARS, FIRST_CHUNK_CHARS);
  if (chunks.length === 0) return "done";

  stopPiper();
  const id = playbackId;
  const urls = chunks.map((chunk) => buildPiperUrl(chunk, lang, speed));

  for (let i = 0; i < urls.length; i++) {
    try {
      await playOne(urls[i], id, urls[i + 1]);
    } catch (err) {
      if (id !== playbackId) return "stopped";
      if (i === 0) throw err;
      return "done";
    }
    if (id !== playbackId) return "stopped";
  }
  if (id === playbackId) currentAudio = null;
  return "done";
}
