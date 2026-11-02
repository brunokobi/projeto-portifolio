import { useCallback, useEffect, useRef, useState } from 'react';

interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

interface Options {
  lang: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
}

export function useSpeechRecognition({ lang, onInterim, onFinal }: Options) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const callbacksRef = useRef({ onInterim, onFinal });

  useEffect(() => {
    callbacksRef.current = { onInterim, onFinal };
  }, [onInterim, onFinal]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final.trim()) callbacksRef.current.onFinal(final.trim());
      else if (interim) callbacksRef.current.onInterim(interim);
    };
    recognition.onerror = (e) => {
      setError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'Permita o uso do microfone no navegador para falar com o JARVIS.'
          : e.error === 'no-speech'
            ? 'Não ouvi nada. Toque no microfone e fale de novo.'
            : null
      );
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, error, start, stop, supported: isSpeechRecognitionSupported() };
}
