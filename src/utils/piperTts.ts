// Voz neural (Piper) servida pela VPS em tts.brunokobi.tech. Quem chama cai para
// a voz do navegador quando o idioma não tem voz no Piper ou o serviço falha.
export const PIPER_TTS_URL = "https://tts.brunokobi.tech/tts.mp3";
// Muda a chave de cache da Cloudflare: as cópias antigas não tinham o cabeçalho CORS
// que o analisador de espectro (crossOrigin) exige.
const CACHE_VERSION = "2";

const PIPER_LANGS = new Set(["pt", "en", "es", "fr", "de", "ru", "ar"]);
const MAX_CHUNK_CHARS = 400;
// Na VPS cada 100 caracteres levam ~1,5s: o primeiro trecho curto faz a fala começar logo.
const FIRST_CHUNK_CHARS = 120;

type Replacement = string | ((match: string, ...groups: string[]) => string);

const PRONUNCIATION: Record<string, [RegExp, Replacement][]> = {
  pt: [
    [/\bJARVIS\b/gi, "Járvis"],
    [/\bGithub\b/gi, "Git Hub"],
    [/\bbrunokobi(\d*)\b/gi, (_m, n: string) => (n ? `bruno cóbi ${n}` : "bruno cóbi")],
    [/\bKobi\b/gi, "Cóbi"],
    [/\bVennx\b/gi, "Vénix"],
  ],
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
    // Endereço sem http (github.com/brunokobi) é falado só pelo último trecho: "brunokobi".
    .replace(
      /\b(?:[\w-]+\.)+(?:com|tech|br|io|dev|app|net|org)(?:\/([\w.-]+))*\/?(?=[\s.,;!?)]|$)/gi,
      (match, last?: string) => (match.includes("@") ? match : (last ?? match))
    )
    .replace(/[*_#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (lang === "pt") {
    clean = clean
      .replace(
        /\b([\w.-]+)@([\w-]+)\.([a-z.]+[a-z])/gi,
        (_m, user: string, host: string, tld: string) =>
          `${user} arroba ${host} ponto ${tld.split(".").join(" ponto ")}`
      )
      .replace(/\b([\w-]+)\.(com|tech|br|io|dev|app|net|org)\b/gi, "$1 ponto $2");
  }
  for (const [pattern, replacement] of PRONUNCIATION[lang] ?? []) {
    clean =
      typeof replacement === "string"
        ? clean.replace(pattern, replacement)
        : clean.replace(pattern, replacement);
  }
  return clean;
}

// Frases curtas começam a tocar antes e não passam do limite do servidor.
export function splitIntoChunks(
  text: string,
  maxChars = MAX_CHUNK_CHARS,
  firstMaxChars = maxChars
): string[] {
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
  const params = new URLSearchParams({
    text,
    lang,
    speed: (Math.round(speed * 10) / 10).toFixed(1),
    v: CACHE_VERSION,
  });
  return `${PIPER_TTS_URL}?${params.toString()}`;
}

let playbackId = 0;
let currentAudio: HTMLAudioElement | null = null;
let releaseCurrent: (() => void) | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

// Passa o áudio por um AnalyserNode para o JARVIS Core desenhar o espectro real da fala.
// Com o AudioContext ainda suspenso (sem gesto do usuário) o áudio toca direto, sem análise,
// porque um elemento ligado a um contexto parado fica mudo.
function connectAnalyser(audio: HTMLAudioElement): void {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume().catch(() => {});
    if (audioContext.state !== "running") return;
    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      analyser.connect(audioContext.destination);
    }
    audioContext.createMediaElementSource(audio).connect(analyser);
  } catch {
    // Sem análise o áudio continua tocando normalmente.
  }
}

/** Analisador da fala em andamento, ou null quando o Piper não está falando. */
export function getPiperAnalyser(): AnalyserNode | null {
  return currentAudio ? analyser : null;
}

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
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;
    connectAnalyser(audio);
    currentAudio = audio;
    releaseCurrent = () => resolve();
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("piper: falha ao carregar o áudio"));
    audio.play().then(
      () => {
        if (next) {
          const preload = new Audio();
          preload.crossOrigin = "anonymous";
          preload.preload = "auto";
          preload.src = next;
        }
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
export async function playPiper(
  text: string,
  language: string,
  speed: number
): Promise<"done" | "stopped"> {
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
