import { useEffect, useRef } from 'react';

export type JarvisState = 'idle' | 'thinking' | 'speaking' | 'listening';

const GREEN = '66, 201, 32';
const BAR_COUNT = 24;

// O espectro é animado, não vem do áudio real: a Web Speech API não expõe o sinal do TTS.
export function JarvisCore({ state, size = 72 }: { state: JarvisState; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const bars = new Array(BAR_COUNT).fill(0);
    const c = size / 2;
    const inner = size * 0.24;
    let frame = 0;
    let raf = 0;

    const draw = () => {
      const s = stateRef.current;
      const active = s !== 'idle';
      const t = reduceMotion ? 0 : frame / 60;
      ctx.clearRect(0, 0, size, size);

      ctx.strokeStyle = `rgba(${GREEN}, ${active ? 0.35 : 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, size * 0.47, 0, Math.PI * 2);
      ctx.stroke();

      if (s === 'thinking' || s === 'listening') {
        const speed = s === 'thinking' ? 3 : 1.5;
        ctx.strokeStyle = `rgba(${GREEN}, 0.9)`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const start = t * speed + (k * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(c, c, size * 0.4, start, start + Math.PI / 4);
          ctx.stroke();
        }
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const target =
          s === 'speaking'
            ? 0.35 + Math.random() * 0.65
            : s === 'listening'
              ? 0.2 + 0.3 * Math.abs(Math.sin(t * 4 + i))
              : 0.12 + 0.06 * Math.sin(t * 1.5 + i * 0.5);
        bars[i] += (target - bars[i]) * 0.25;
        const angle = (i / BAR_COUNT) * Math.PI * 2;
        const len = bars[i] * size * 0.14;
        ctx.strokeStyle = `rgba(${GREEN}, ${0.35 + bars[i] * 0.65})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(angle) * inner, c + Math.sin(angle) * inner);
        ctx.lineTo(c + Math.cos(angle) * (inner + len), c + Math.sin(angle) * (inner + len));
        ctx.stroke();
      }

      const pulse = active ? 0.5 + 0.5 * Math.sin(t * 5) : 0.3;
      const glow = ctx.createRadialGradient(c, c, 1, c, c, inner);
      glow.addColorStop(0, `rgba(${GREEN}, ${0.35 + pulse * 0.4})`);
      glow.addColorStop(1, `rgba(${GREEN}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(c, c, inner, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${GREEN}, ${active ? 1 : 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c, c, inner * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: state === 'idle' ? 'none' : `drop-shadow(0 0 8px rgba(${GREEN}, 0.6))`,
      }}
    />
  );
}
