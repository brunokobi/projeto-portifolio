import { Box } from '@chakra-ui/react';

const CYAN = '#00FFFF';

export function JarvisCore({ isActive }: { isActive: boolean }) {
  return (
    <Box
      position="relative"
      w="200px"
      h="200px"
      mx="auto"
      my={4}
      opacity={isActive ? 1 : 0.3}
      transition="all 0.3s"
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer ring - rotating */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke={CYAN}
          strokeWidth="1"
          opacity={isActive ? 0.4 : 0.2}
          style={{
            animation: isActive ? 'rotate360 8s linear infinite' : 'none',
          }}
        />

        {/* Ring 2 */}
        <circle
          cx="100"
          cy="100"
          r="75"
          fill="none"
          stroke={CYAN}
          strokeWidth="1"
          opacity={isActive ? 0.3 : 0.15}
          style={{
            animation: isActive ? 'rotate360-reverse 6s linear infinite' : 'none',
          }}
        />

        {/* Ring 3 - inner */}
        <circle
          cx="100"
          cy="100"
          r="55"
          fill="none"
          stroke={CYAN}
          strokeWidth="2"
          opacity={isActive ? 0.6 : 0.3}
        />

        {/* Core glow */}
        <circle
          cx="100"
          cy="100"
          r="35"
          fill={CYAN}
          opacity={isActive ? 0.15 : 0.05}
          style={{
            filter: 'blur(8px)',
            animation: isActive ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
          }}
        />

        {/* Core circle */}
        <circle
          cx="100"
          cy="100"
          r="30"
          fill="none"
          stroke={CYAN}
          strokeWidth="3"
          opacity={isActive ? 1 : 0.5}
          style={{
            filter: `drop-shadow(0 0 ${isActive ? 12 : 4}px ${CYAN})`,
          }}
        />

        {/* Inner core */}
        <circle
          cx="100"
          cy="100"
          r="20"
          fill={CYAN}
          opacity={isActive ? 0.3 : 0.1}
        />

        {/* Scan lines - horizontal */}
        <g opacity={isActive ? 0.4 : 0.1}>
          <line x1="50" y1="100" x2="150" y2="100" stroke={CYAN} strokeWidth="1" />
          <line x1="45" y1="85" x2="155" y2="85" stroke={CYAN} strokeWidth="0.5" />
          <line x1="45" y1="115" x2="155" y2="115" stroke={CYAN} strokeWidth="0.5" />
        </g>

        {/* Dots on rings */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 85 * Math.cos(rad);
          const y = 100 + 85 * Math.sin(rad);
          return (
            <circle
              key={`outer-${angle}`}
              cx={x}
              cy={y}
              r="2"
              fill={CYAN}
              opacity={isActive ? 0.8 : 0.3}
            />
          );
        })}
      </svg>

      <style>{`
        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotate360-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            r: 35;
            opacity: 0.15;
          }
          50% {
            r: 40;
            opacity: 0.25;
          }
        }
      `}</style>
    </Box>
  );
}
