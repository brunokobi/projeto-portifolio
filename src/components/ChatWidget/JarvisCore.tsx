import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

const GREEN = '#42c920';

export function JarvisCore({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [spectrum, setSpectrum] = useState<number[]>(Array(16).fill(0));

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // Simula dados de áudio (espectro animado)
    const animate = () => {
      setSpectrum((prev) =>
        prev.map((val) => {
          const target = Math.random() * 0.8 + (isActive ? 0.2 : 0);
          return val + (target - val) * 0.2;
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const innerRadius = 35;
    const outerRadius = 85;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, w, h);

    // Draw outer rings
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1;
    ctx.globalAlpha = isActive ? 0.4 : 0.2;

    // Ring 3
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 2
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 1
    ctx.globalAlpha = isActive ? 0.6 : 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius + 15, 0, Math.PI * 2);
    ctx.stroke();

    // Draw spectrum bars (16 bars around the center)
    ctx.globalAlpha = 1;
    const barCount = 16;
    spectrum.forEach((value, i) => {
      const angle = (i / barCount) * Math.PI * 2;
      const barHeight = (value * 25) + 5;
      const startRadius = innerRadius;
      const endRadius = startRadius + barHeight;

      const x1 = centerX + Math.cos(angle) * startRadius;
      const y1 = centerY + Math.sin(angle) * startRadius;
      const x2 = centerX + Math.cos(angle) * endRadius;
      const y2 = centerY + Math.sin(angle) * endRadius;

      // Bar glow
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.3 + value * 0.7;
      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Bar core
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6 + value * 0.4;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // Draw center glow
    ctx.globalAlpha = isActive ? 0.3 : 0.1;
    const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 25);
    gradient.addColorStop(0, GREEN);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw core circle
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 3;
    ctx.globalAlpha = isActive ? 1 : 0.5;
    ctx.shadowColor = GREEN;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw play button in center (if not speaking)
    if (!isActive) {
      ctx.fillStyle = GREEN;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(centerX + 5, centerY - 8);
      ctx.lineTo(centerX + 5, centerY + 8);
      ctx.lineTo(centerX - 5, centerY);
      ctx.closePath();
      ctx.fill();
    }
  }, [spectrum, isActive]);

  return (
    <Box
      position="relative"
      w="100%"
      maxW="250px"
      mx="auto"
      my={4}
      opacity={isActive ? 1 : 0.5}
      transition="all 0.3s"
    >
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          filter: isActive ? 'drop-shadow(0 0 20px #42c920)' : 'none',
        }}
      />
    </Box>
  );
}
