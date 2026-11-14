import { useState, useEffect, useRef } from "react";

interface TypewriterOptions {
  speed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
  gapMs?: number;
  paused?: boolean;
}

interface TypewriterResult {
  text: string;
  index: number;
}

const PAUSED_RECHECK_MS = 200;

const useTypewriter = (
  strings: string[],
  { speed = 70, deleteSpeed = 40, pauseMs = 3800, gapMs = 600, paused = false }: TypewriterOptions = {}
): TypewriterResult => {
  const [result, setResult] = useState<TypewriterResult>({ text: "", index: 0 });
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const key = strings.join("\u0000");

  useEffect(() => {
    const phrases = key ? key.split("\u0000") : [];
    if (!phrases.length) return;
    let idx = 0;
    let pos = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[idx];

      if (!deleting) {
        pos += 1;
        setResult({ text: current.slice(0, pos), index: idx });
        if (pos >= current.length) {
          deleting = true;
          timeout = setTimeout(tick, pauseMs);
        } else {
          timeout = setTimeout(tick, speed);
        }
        return;
      }

      if (pausedRef.current && pos >= current.length) {
        timeout = setTimeout(tick, PAUSED_RECHECK_MS);
        return;
      }

      pos -= 1;
      setResult({ text: current.slice(0, pos), index: idx });
      if (pos <= 0) {
        deleting = false;
        idx = (idx + 1) % phrases.length;
        timeout = setTimeout(tick, gapMs);
      } else {
        timeout = setTimeout(tick, deleteSpeed);
      }
    };

    timeout = setTimeout(tick, speed);
    return () => clearTimeout(timeout);
  }, [key, speed, deleteSpeed, pauseMs, gapMs]);

  return result;
};

export default useTypewriter;
