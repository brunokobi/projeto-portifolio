import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  angle: (360 / 20) * i,
  delay: 0.12 + i * 0.018,
  size: i % 3 === 0 ? 5 : i % 3 === 1 ? 3 : 2,
  color: i % 4 === 0 ? '#ffffff' : i % 4 === 1 ? '#00e5ff' : i % 4 === 2 ? '#42c920' : '#aaffcc',
  dist: 38 + (i % 5) * 8, // vmin
}))

const RINGS = [
  { delay: 0.05, dur: 1.4, color: '#ffffff', w: 2.5, blur: 12 },
  { delay: 0.18, dur: 1.6, color: '#00e5ff', w: 1.5, blur: 8  },
  { delay: 0.30, dur: 1.9, color: '#42c920', w: 1,   blur: 6  },
  { delay: 0.45, dur: 2.2, color: '#00e5ff', w: 0.8, blur: 4  },
  { delay: 0.60, dur: 2.6, color: '#42c920', w: 0.5, blur: 2  },
]

const BEAMS = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30,
  delay: 0.08 + i * 0.04,
  color: i % 2 === 0 ? '#00e5ff' : '#42c920',
  opacity: i % 3 === 0 ? 0.7 : 0.4,
}))

const CSS = `
  @keyframes bb-flash {
    0%   { transform:translate(-50%,-50%) scale(0);  opacity:1; }
    25%  { transform:translate(-50%,-50%) scale(20); opacity:0.85; }
    100% { transform:translate(-50%,-50%) scale(60); opacity:0; }
  }
  @keyframes bb-ring {
    0%   { transform:translate(-50%,-50%) scale(0); opacity:0.9; }
    100% { transform:translate(-50%,-50%) scale(10); opacity:0; }
  }
  @keyframes bb-orb {
    0%   { transform:translate(-50%,-50%) scale(0); opacity:0; }
    15%  { opacity:1; }
    40%  { transform:translate(-50%,-50%) scale(1.2); }
    70%  { transform:translate(-50%,-50%) scale(0.9); opacity:0.95; }
    100% { transform:translate(-50%,-50%) scale(0.7); opacity:0.6; }
  }
  @keyframes bb-beam {
    0%   { opacity:0; height:0; }
    20%  { opacity:var(--bop); }
    100% { height:55vmax; opacity:0; }
  }
  @keyframes bb-particle {
    0%   { opacity:1; transform:rotate(var(--pa)) translateY(0)      scale(1.2); }
    70%  { opacity:0.9; }
    100% { opacity:0; transform:rotate(var(--pa)) translateY(calc(var(--pd) * -1vmin)) scale(0.2); }
  }
  @keyframes bb-star-pulse {
    0%,100% { opacity:0.3; transform:scale(1); }
    50%      { opacity:1;   transform:scale(1.6); }
  }
  @keyframes bb-text-in {
    0%   { opacity:0; letter-spacing:1.5em; }
    100% { opacity:0.6; letter-spacing:0.35em; }
  }
`

const BigBangLoader = ({ onDone }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 2800)
    const done = setTimeout(() => onDone?.(), 3800)
    return () => { clearTimeout(hide); clearTimeout(done) }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'radial-gradient(ellipse at center, #04080f 0%, #000000 100%)',
            overflow: 'hidden',
          }}
        >
          <style>{CSS}</style>

          {/* Flash central */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 6, height: 6, borderRadius: '50%',
            background: '#fff',
            animation: 'bb-flash 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s forwards',
            opacity: 0,
          }} />

          {/* Anéis de choque */}
          {RINGS.map((r, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 30, height: 30, borderRadius: '50%',
              border: `${r.w}px solid ${r.color}`,
              boxShadow: `0 0 ${r.blur}px ${r.color}`,
              animation: `bb-ring ${r.dur}s ease-out ${r.delay}s forwards`,
              opacity: 0,
            }} />
          ))}

          {/* Orb central — o "proto-planeta" */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 28, height: 28, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #fff 0%, #00e5ff 35%, #42c920 70%, #003311 100%)',
            boxShadow: '0 0 40px 16px #00e5ff88, 0 0 80px 40px #42c92044, 0 0 0 0 #fff',
            animation: 'bb-orb 2.8s cubic-bezier(0.16,1,0.3,1) 0.08s forwards',
            opacity: 0,
          }} />

          {/* Raios de energia */}
          {BEAMS.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', left: 'calc(50% - 0.5px)', top: '50%',
              width: 1, height: 0,
              background: `linear-gradient(to top, transparent 0%, ${b.color} 40%, #fff 100%)`,
              transformOrigin: 'bottom center',
              transform: `rotate(${b.angle}deg)`,
              '--bop': b.opacity,
              animation: `bb-beam 1.3s ease-out ${b.delay}s forwards`,
              opacity: 0,
            }} />
          ))}

          {/* Partículas */}
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: 'calc(50% - 2px)', top: 'calc(50% - 2px)',
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transformOrigin: 'center center',
              '--pa': `${p.angle}deg`,
              '--pd': p.dist,
              animation: `bb-particle 1.1s cubic-bezier(0.2,0.8,0.3,1) ${p.delay}s forwards`,
              opacity: 0,
            }} />
          ))}

          {/* Estrelas de fundo pulsando */}
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 137.5) % 100}%`,
              top:  `${(i * 97.3)  % 100}%`,
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#00e5ff' : '#fff',
              animation: `bb-star-pulse ${1.2 + (i % 7) * 0.3}s ease-in-out ${(i * 0.07) % 1.2}s infinite`,
            }} />
          ))}

          {/* Texto loading */}
          <div style={{
            position: 'absolute', bottom: '10%', left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#42c920',
            animation: 'bb-text-in 1.2s ease-out 0.4s forwards',
            opacity: 0,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}>
            inicializando universo
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BigBangLoader
