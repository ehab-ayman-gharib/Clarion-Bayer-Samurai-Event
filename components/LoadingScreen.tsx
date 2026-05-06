import React, { useEffect, useRef } from 'react';

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Japanese Kanji and Feather symbols for the Samurai theme
    const symbols = [
      '🪶', '剣', '羽', '侍', '道', '魂', '力', '心', '影', '光', '🪶', '武', '士', '刃'
    ];

    const fontSize = 38;
    const spacing = 1.4;
    const columns = Math.ceil(width / (fontSize * spacing));

    const drops = new Array(columns).fill(0).map(() => ({
      y: Math.random() * -20,
      charIndices: new Array(12).fill(0).map(() => Math.floor(Math.random() * symbols.length))
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px "KyivTypeSerif", "Segoe UI Historic", serif`;

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        const x = i * (fontSize * spacing);

        for (let j = 0; j < drop.charIndices.length; j++) {
          const symbol = symbols[drop.charIndices[j]];
          const y = (drop.y - j) * fontSize;

          if (y < -fontSize || y > height + fontSize) continue;

          const alpha = Math.max(0, 1 - (j / drop.charIndices.length));

          if (j === 0) {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.9})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
          } else {
            ctx.fillStyle = `rgba(0, 150, 255, ${alpha * 0.5})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(symbol, x, y);
          ctx.shadowBlur = 0;
        }

        drop.y += 0.22;

        if (drop.y - drop.charIndices.length > height / fontSize) {
          drop.y = -2;
          drop.charIndices = drop.charIndices.map(() => Math.floor(Math.random() * symbols.length));
        }
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[-1] opacity-30" />;
};

/**
 * FeatherBlade Spinner:
 * Draws a spinning feather with a glowing cyan rachis (spine),
 * surrounded by orbiting energy particles.
 */
const FeatherBladeSpinner: React.FC<{ size?: number }> = ({ size = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const bladeLength = size * 0.38;
    const bladeWidth = size * 0.06;

    // Orbiting particles
    const particles = Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.8,
      size: 1 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    let time = 0;

    const drawFeather = (rotation: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // Outer glow aura
      const auraGrad = ctx.createRadialGradient(0, 0, bladeLength * 0.2, 0, 0, bladeLength * 1.2);
      auraGrad.addColorStop(0, 'rgba(0, 255, 255, 0.08)');
      auraGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bladeLength * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw feather barbs (left side)
      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const y = -bladeLength + t * bladeLength * 2;
        const w = bladeWidth * Math.sin(t * Math.PI) * (1 + 0.3 * Math.sin(time * 2 + t * 5));

        ctx.strokeStyle = `rgba(0, 200, 255, ${0.15 + 0.15 * Math.sin(time * 3 + i)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(-w * 1.5, y - bladeLength * 0.04, -w * 2, y - bladeLength * 0.08);
        ctx.stroke();
      }

      // Draw feather barbs (right side)
      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const y = -bladeLength + t * bladeLength * 2;
        const w = bladeWidth * Math.sin(t * Math.PI) * (1 + 0.3 * Math.sin(time * 2 + t * 5));

        ctx.strokeStyle = `rgba(0, 200, 255, ${0.15 + 0.15 * Math.sin(time * 3 + i)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(w * 1.5, y - bladeLength * 0.04, w * 2, y - bladeLength * 0.08);
        ctx.stroke();
      }

      // Feather body (vane shape — elongated leaf)
      const bodyGrad = ctx.createLinearGradient(0, -bladeLength, 0, bladeLength);
      bodyGrad.addColorStop(0, 'rgba(0, 255, 255, 0.02)');
      bodyGrad.addColorStop(0.3, 'rgba(0, 200, 255, 0.12)');
      bodyGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.18)');
      bodyGrad.addColorStop(0.7, 'rgba(0, 200, 255, 0.12)');
      bodyGrad.addColorStop(1, 'rgba(0, 255, 255, 0.02)');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.quadraticCurveTo(-bladeWidth, -bladeLength * 0.3, -bladeWidth * 0.8, 0);
      ctx.quadraticCurveTo(-bladeWidth, bladeLength * 0.3, 0, bladeLength);
      ctx.quadraticCurveTo(bladeWidth, bladeLength * 0.3, bladeWidth * 0.8, 0);
      ctx.quadraticCurveTo(bladeWidth, -bladeLength * 0.3, 0, -bladeLength);
      ctx.fill();

      // Glowing rachis (central spine) — the electric blue core
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#00ffff';

      const spineGrad = ctx.createLinearGradient(0, -bladeLength, 0, bladeLength);
      spineGrad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      spineGrad.addColorStop(0.2, 'rgba(0, 255, 255, 0.95)');
      spineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      spineGrad.addColorStop(0.8, 'rgba(0, 255, 255, 0.95)');
      spineGrad.addColorStop(1, 'rgba(0, 255, 255, 0.3)');

      ctx.strokeStyle = spineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.lineTo(0, bladeLength);
      ctx.stroke();

      // Inner bright core line
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength * 0.9);
      ctx.lineTo(0, bladeLength * 0.9);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Katana hilt (tsuka) at the base
      const hiltY = bladeLength;
      const hiltW = bladeWidth * 1.2;
      const hiltH = bladeLength * 0.2;

      // Tsuba (guard)
      ctx.fillStyle = 'rgba(180, 160, 120, 0.8)';
      ctx.beginPath();
      ctx.ellipse(0, hiltY, hiltW * 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Handle wrap
      const wrapGrad = ctx.createLinearGradient(0, hiltY, 0, hiltY + hiltH);
      wrapGrad.addColorStop(0, 'rgba(60, 50, 40, 0.9)');
      wrapGrad.addColorStop(1, 'rgba(40, 30, 25, 0.9)');
      ctx.fillStyle = wrapGrad;
      ctx.beginPath();
      ctx.roundRect(-hiltW * 0.5, hiltY, hiltW, hiltH, 4);
      ctx.fill();

      // Ito wrap lines
      ctx.strokeStyle = 'rgba(100, 90, 70, 0.7)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const wy = hiltY + (i / 5) * hiltH + 4;
        ctx.beginPath();
        ctx.moveTo(-hiltW * 0.4, wy);
        ctx.lineTo(hiltW * 0.4, wy);
        ctx.stroke();
      }

      ctx.restore();
    };

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      time += 0.016;

      ctx.clearRect(0, 0, size, size);

      // Draw orbiting energy particles
      for (const p of particles) {
        p.angle += p.speed * 0.016;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;
        const flicker = 0.5 + 0.5 * Math.sin(time * 4 + p.angle * 3);

        ctx.beginPath();
        ctx.arc(px, py, p.size * flicker, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha * flicker * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Slowly rotating feather blade
      const rotation = time * 0.8;
      drawFeather(rotation);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
};

export const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl text-center p-6 overflow-hidden">
      <MatrixRain />

      <div className="relative mb-8 animate-pulse-slow">
        <FeatherBladeSpinner size={420} />
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" />
      </div>

      <div className="space-y-4 relative z-10">
        <h3
          className="text-4xl font-bold text-white tracking-[0.3em] uppercase animate-in slide-in-bottom duration-700"
          style={{
            fontFamily: '"Cinzel", serif',
            textShadow: '0 0 15px rgba(0, 255, 255, 0.7), 0 0 30px rgba(0, 255, 255, 0.4)',
            lineHeight: '1.4'
          }}
        >
          SYNTHESIZING<br />WARRIOR SPIRIT...
        </h3>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
