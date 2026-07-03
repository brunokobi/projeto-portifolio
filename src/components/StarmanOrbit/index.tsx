import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Tesla Roadster + Starman em SVG inline
const TeslaRoadsterSVG = () => (
  <svg width="76" height="34" viewBox="0 0 76 34" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo principal */}
    <path d="M4,21 Q7,12 19,10 L52,10 Q62,10 66,14 L70,21 Z" fill="#c0392b" />
    {/* Teto */}
    <path d="M18,10 Q22,3 33,2 L48,2 Q56,3 59,10 Z" fill="#a93226" />
    {/* Parabrisa */}
    <path d="M21,10 L25,2 L48,2 L52,10 Z" fill="#0d1b2a" opacity="0.88" />
    {/* Janela traseira */}
    <path d="M52,10 L58,13 L59,10 Z" fill="#0d1b2a" opacity="0.6" />
    {/* Starman — capacete */}
    <circle cx="36" cy="5.5" r="3.4" fill="#dde3ea" />
    {/* Visor */}
    <ellipse cx="36" cy="6" rx="2.2" ry="1.7" fill="#3a7bd5" opacity="0.8" />
    {/* Chassi inferior */}
    <rect x="4" y="21" width="66" height="5" rx="2" fill="#922b21" />
    {/* Para-choque dianteiro */}
    <rect x="2" y="22" width="5" height="3" rx="1" fill="#7b241c" />
    {/* Para-choque traseiro */}
    <rect x="69" y="22" width="5" height="3" rx="1" fill="#7b241c" />
    {/* Roda dianteira */}
    <circle cx="16" cy="25" r="7" fill="#0a0a0a" />
    <circle cx="16" cy="25" r="4.5" fill="#1c1c1c" />
    <circle cx="16" cy="25" r="2" fill="#4a4a4a" />
    {/* Roda traseira */}
    <circle cx="56" cy="25" r="7" fill="#0a0a0a" />
    <circle cx="56" cy="25" r="4.5" fill="#1c1c1c" />
    <circle cx="56" cy="25" r="2" fill="#4a4a4a" />
    {/* Detalhe lateral */}
    <line x1="52" y1="10" x2="59" y2="15" stroke="#7b241c" strokeWidth="0.8" />
    {/* Faróis */}
    <ellipse cx="71" cy="17" rx="2" ry="1.5" fill="#fff8aa" opacity="0.7" />
    <ellipse cx="5" cy="17" rx="2" ry="1.5" fill="#fff8aa" opacity="0.3" />
  </svg>
);

const ORBIT_PERIOD = 22000;

const StarmanOrbit = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 16 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 16 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 55);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 28);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) / ORBIT_PERIOD) * Math.PI * 2;
      const rx = window.innerWidth * 0.40;
      const ry = window.innerHeight * 0.22;
      const cx = window.innerWidth * 0.50;
      const cy = window.innerHeight * 0.46;

      const x = cx + rx * Math.cos(t);
      const y = cy + ry * Math.sin(t);

      // Tangente → rotação do carro
      const dx = -rx * Math.sin(t);
      const dy = ry * Math.cos(t);
      const rot = Math.atan2(dy, dx) * (180 / Math.PI);

      if (outerRef.current) {
        outerRef.current.style.left = `${x}px`;
        outerRef.current.style.top = `${y}px`;
      }
      if (rotRef.current) {
        rotRef.current.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={outerRef}
      style={{ position: "fixed", zIndex: 15, pointerEvents: "auto", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div style={{ x: springX, y: springY }}>
        <div ref={rotRef} style={{ position: "relative" }}>
          <TeslaRoadsterSVG />

          {/* Tooltip Starman */}
          {hovered && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.88)",
                border: "1px solid #42c920",
                borderRadius: "4px",
                padding: "4px 10px",
                whiteSpace: "nowrap",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#42c920",
                pointerEvents: "none",
                boxShadow: "0 0 8px rgba(66,201,32,0.3)",
              }}
            >
              🚀 Starman · Tesla Roadster · 2018
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StarmanOrbit;
