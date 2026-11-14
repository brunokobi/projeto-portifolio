import { useCallback, useEffect, useRef, useState } from 'react';

// Microfone do chat: grava no navegador e transcreve no Whisper da VPS
// (whisper.brunokobi.tech, gateway com CORS liberado para o site).
export const WHISPER_URL = 'https://whisper.brunokobi.tech/inference';

const SILENCE_RMS = 0.015;
const SILENCE_AFTER_SPEECH_MS = 1500;
const NO_SPEECH_TIMEOUT_MS = 8000;
const MAX_RECORDING_MS = 30000;
const TRANSCRIBE_TIMEOUT_MS = 30000;

// Vocabulário que o Whisper deve esperar: sem ele, "Kobi" vira "Cove" e "Vennx" vira "Vênix".
export const WHISPER_PROMPT =
  'Conversa com o JARVIS sobre Bruno Kobi, da Vennx: React, TypeScript, Node.js, n8n, Supabase, LangChain, GitHub, LinkedIn.';

// Marcações que o Whisper devolve para trechos sem fala.
const NON_SPEECH = /\[[^\]]*\]|\((?:música|music|risos|silêncio|inaudível)[^)]*\)/gi;

export function isWhisperSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

export function cleanTranscript(text: string): string {
  return text.replace(NON_SPEECH, ' ').replace(/\s+/g, ' ').trim();
}

function fileNameFor(mimeType: string): string {
  if (mimeType.includes('ogg')) return 'audio.ogg';
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'audio.mp4';
  return 'audio.webm';
}

export async function transcribe(blob: Blob, language: string): Promise<string> {
  const form = new FormData();
  form.append('file', blob, fileNameFor(blob.type));
  form.append('language', language);
  form.append('response_format', 'json');
  form.append('prompt', WHISPER_PROMPT);
  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`whisper respondeu ${res.status}`);
  const data = (await res.json()) as { text?: unknown };
  return typeof data.text === 'string' ? cleanTranscript(data.text) : '';
}

interface Options {
  language: string;
  onFinal: (text: string) => void;
}

export function useWhisperRecorder({ language, onFinal }: Options) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(
    () => () => {
      cleanupRef.current();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    },
    []
  );

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      setError('Permita o uso do microfone no navegador para falar com o JARVIS.');
      return;
    }

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | null = null;
    let audioContext: AudioContext | null = null;
    // Sem AudioContext não dá para medir o volume: assume que houve fala.
    let heardSpeech = typeof window.AudioContext === 'undefined';

    const cleanup = () => {
      timers.forEach(clearTimeout);
      if (interval) clearInterval(interval);
      stream.getTracks().forEach((t) => t.stop());
      void audioContext?.close().catch(() => {});
    };
    cleanupRef.current = cleanup;

    if (typeof window.AudioContext !== 'undefined') {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let silentSince = performance.now();
      interval = setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length);
        const now = performance.now();
        if (rms > SILENCE_RMS) {
          heardSpeech = true;
          silentSince = now;
        } else if (heardSpeech && now - silentSince > SILENCE_AFTER_SPEECH_MS) {
          stop();
        }
      }, 100);
      timers.push(
        setTimeout(() => {
          if (!heardSpeech) stop();
        }, NO_SPEECH_TIMEOUT_MS)
      );
    }
    timers.push(setTimeout(stop, MAX_RECORDING_MS));

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = async () => {
      cleanup();
      recorderRef.current = null;
      setIsListening(false);
      if (!heardSpeech || chunks.length === 0) {
        setError('Não ouvi nada. Toque no microfone e fale de novo.');
        return;
      }
      setIsTranscribing(true);
      try {
        const text = await transcribe(new Blob(chunks, { type: recorder.mimeType }), language);
        if (text) onFinalRef.current(text);
        else setError('Não entendi o que você disse. Tente de novo ou digite a pergunta.');
      } catch {
        setError('Não consegui transcrever agora. Tente de novo ou digite a pergunta.');
      } finally {
        setIsTranscribing(false);
      }
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsListening(true);
  }, [language, stop]);

  return { isListening, isTranscribing, error, start, stop, supported: isWhisperSupported() };
}
