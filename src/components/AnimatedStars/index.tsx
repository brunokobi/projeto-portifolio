import { useEffect, useRef } from "react";

// Cores realistas: predominantemente branco com acento verde do tema
const PALETTE = [
  { color: "255,255,255",   weight: 45 }, // branco puro
  { color: "220,240,255",   weight: 18 }, // branco-azulado (estrelas quentes)
  { color: "255,248,220",   weight: 12 }, // branco-amarelado (estrelas frias)
  { color: "210,255,210",   weight: 12 }, // branco esverdeado (acento tema)
  { color: "180,255,160",   weight:  8 }, // verde claro
  { color: "66,201,32",     weight:  5 }, // verde marca (raras)
];

const pickColor = () => {
  const total = PALETTE.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PALETTE) { r -= p.weight; if (r <= 0) return p.color; }
  return PALETTE[0].color;
};

type Star = {
  x: number; y: number; radius: number; color: string;
  baseAlpha: number; twinkleAmp: number; twinkleFreq: number;
  twinklePhase: number; glow: boolean;
};
type TrailPoint = { x: number; y: number };
type Shooter = {
  x: number; y: number; vx: number; vy: number;
  trail: TrailPoint[]; life: number; decay: number;
};

const AnimatedStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    let t = 0;
    let lastTs: number | null = null;
    let lastShoot = 0;
    let nextShoot = 9000 + Math.random() * 14000;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const makeStar = () => {
      const r        = Math.random();
      const radius   = r < 0.6 ? Math.random() * 0.7 + 0.2   // pequenas
                     : r < 0.9 ? Math.random() * 0.6 + 0.9   // médias
                                : Math.random() * 0.8 + 1.5;  // grandes
      return {
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        radius,
        color:   pickColor(),
        baseAlpha: radius > 1.4 ? 0.6 + Math.random() * 0.4   // brilhantes
                 : radius > 0.9 ? 0.35 + Math.random() * 0.35
                                : 0.15 + Math.random() * 0.25, // tênues
        twinkleAmp:   0.15 + Math.random() * 0.3,
        twinkleFreq:  0.4  + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        glow:    radius > 1.2 && Math.random() > 0.4,
      };
    };

    const initStars = () => {
      const density = Math.floor((canvas.width * canvas.height) / 2800);
      const count   = Math.min(480, Math.max(160, density));
      stars = Array.from({ length: count }, makeStar);
    };

    const addShooter = () => {
      const angle = (Math.PI / 8) + Math.random() * (Math.PI / 5); // 22–58°
      const speed = 9 + Math.random() * 7;
      shooters.push({
        x:     Math.random() * canvas.width * 0.8,
        y:     Math.random() * canvas.height * 0.4,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        trail: [],
        life:  1,
        decay: 0.016 + Math.random() * 0.012,
      });
    };

    const draw = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      t += dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Estrelas ──────────────────────────────────────────────────────────
      for (const s of stars) {
        const alpha = Math.max(0, s.baseAlpha + s.twinkleAmp *
          Math.sin(t * s.twinkleFreq * Math.PI * 2 + s.twinklePhase));

        if (s.glow) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 5);
          g.addColorStop(0, `rgba(${s.color},${alpha * 0.55})`);
          g.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.fill();
      }

      // ── Estrelas cadentes ──────────────────────────────────────────────────
      if (ts - lastShoot > nextShoot) {
        addShooter();
        lastShoot = ts;
        nextShoot = 9000 + Math.random() * 14000;
      }

      shooters = shooters.filter(sh => sh.life > 0.02);
      for (const sh of shooters) {
        sh.trail.push({ x: sh.x, y: sh.y });
        if (sh.trail.length > 24) sh.trail.shift();
        sh.x   += sh.vx;
        sh.y   += sh.vy;
        sh.life -= sh.decay;

        for (let i = 0; i < sh.trail.length; i++) {
          const a = (i / sh.trail.length) * sh.life * 0.75;
          const w = (i / sh.trail.length) * 1.8;
          ctx.beginPath();
          ctx.arc(sh.trail[i].x, sh.trail[i].y, Math.max(0.3, w), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fill();
        }

        // brilho da cabeça
        const hg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 6);
        hg.addColorStop(0, `rgba(255,255,255,${sh.life})`);
        hg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const onResize = () => { resize(); initStars(); };

    resize();
    initStars();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
};

export default AnimatedStars;
