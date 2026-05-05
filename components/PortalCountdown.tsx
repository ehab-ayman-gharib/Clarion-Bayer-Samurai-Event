import React from 'react';
import { PortalRing } from './PortalRing';

interface PortalCountdownProps {
  count: number;
}

export const PortalCountdown: React.FC<PortalCountdownProps> = ({ count }) => {
  return (
    <div className="relative flex items-center justify-center animate-scale-in" style={{ width: 480, height: 480 }}>
      {/* Reusable Three.js portal ring */}
      <PortalRing size={480} />

      {/* Countdown number overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{
          fontFamily: '"Lalezar", cursive',
          fontSize: '9rem',
          lineHeight: 1,
          color: '#ffffff',
          textShadow: '0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 50px #ff00ff',
          paddingBottom: '1.5rem' // Fine-tune vertical centering with the ring
        }}
      >
        <span key={count} className="animate-ping-once">
          {count}
        </span>
      </div>

      <style>{`
        @keyframes ping-once {
          0% { transform: scale(1.35); opacity: 0; }
          20% { transform: scale(1); opacity: 1; }
          80% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .animate-ping-once {
          animation: ping-once 1s ease-out forwards;
        }
        .animate-scale-in {
            animation: scale-in 0.5s ease-out forwards;
        }
        @keyframes scale-in {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
