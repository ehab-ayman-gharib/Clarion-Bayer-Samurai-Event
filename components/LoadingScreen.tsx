import React, { useEffect, useRef } from 'react';
import { PortalRing } from './PortalRing';

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Hieroglyphic-like symbols or specific Egyptian-themed characters
    const symbols = [
      '𓂀', '☥', '𓋹', '𓅊', '𓆣', '𓃠', '𓇳', '𓇻', '𓋴', '𓂋', '𓄿', '𓋹',
      '☥', '𓂀', '𓆗', '𓅓', '𓃻', '𓄚', '𓊄'
    ];

    const fontSize = 42;
    const spacing = 1.6;
    const columns = Math.ceil(width / (fontSize * spacing));

    // Track drop state: { y, symbols[] } 
    const drops = new Array(columns).fill(0).map(() => ({
      y: Math.random() * -20,
      charIndices: new Array(12).fill(0).map(() => Math.floor(Math.random() * symbols.length))
    }));

    const draw = () => {
      // CLEAR FULLY for total sharpness
      ctx.clearRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Segoe UI Historic", serif`;

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        const x = i * (fontSize * spacing);

        // Draw a "tail" of sharp symbols with descending opacity
        for (let j = 0; j < drop.charIndices.length; j++) {
          const symbol = symbols[drop.charIndices[j]];
          const y = (drop.y - j) * fontSize;

          if (y < -fontSize || y > height + fontSize) continue;

          // Descending alpha for a clean "comet" look, not blurry
          const alpha = Math.max(0, 1 - (j / drop.charIndices.length));

          // Head of the drop is brighter with a glow
          if (j === 0) {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.9})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
          } else {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.4})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(symbol, x, y);
          ctx.shadowBlur = 0;
        }

        // Advance drop
        drop.y += 0.25;

        // Reset if off bottom
        if (drop.y - drop.charIndices.length > height / fontSize) {
          drop.y = -2;
          // Randomize symbols for the NEXT drop
          drop.charIndices = drop.charIndices.map(() => Math.floor(Math.random() * symbols.length));
        }
      }
    };

    const interval = setInterval(draw, 50); // Sharp 20fps for cinematic scanline feel

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

  return <canvas ref={canvasRef} className="absolute inset-0 z-[-1] opacity-25" />;
};

export const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl text-center p-6 overflow-hidden">
      <MatrixRain />

      <div className="relative mb-2 animate-pulse-slow">
        {/* Portal ring layered above matrix */}
        <PortalRing size={520} />
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
      </div>

      <div className="mt-[-2rem] space-y-4 relative z-10">
        <h3
          className="text-4xl font-bold text-white tracking-[0.3em] uppercase animate-in slide-in-bottom duration-700"
          style={{
            fontFamily: '"Lalezar", cursive',
            textShadow: '0 0 15px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4)'
          }}
        >
          Initializing visual synthesis…..
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
