import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { EraData } from '../types';

interface CapturePreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onProceed: () => void;
  era: EraData | null;
}

export const CapturePreview: React.FC<CapturePreviewProps> = ({ 
  imageSrc, 
  onRetake, 
  onProceed, 
  era 
}) => {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (timeLeft === 0) {
      onProceed();
    }
  }, [timeLeft, onProceed]);

  useEffect(() => {
    // Timer to auto-advance if no action taken
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full relative overflow-hidden bg-black flex flex-col items-center justify-center p-6">
      {/* Background - Blurred or darker version of the booth's environment */}
      <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
         {/* Could add a themed background image here if accessible */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl z-10" />
      </div>

      {/* Main Preview Container - Large rounded portrait as per reference */}
      <div className="relative z-10 w-[85%] h-[75%] max-w-2xl bg-white/10 p-1.5 rounded-[60px] shadow-[0_0_100px_rgba(30,144,255,0.2)] animate-scale-in">
        <div className="w-full h-full rounded-[54px] overflow-hidden border border-white/20">
          <img 
            src={imageSrc} 
            alt="Captured Preview" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Actions Container - Bottom Center */}
      <div className="relative z-20 flex flex-col items-center gap-6 mt-12 w-full animate-slide-in-bottom">
        
        {/* Auto-Proceed Timer Indicator */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
           <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
             Starting AI in <span className="text-white">{timeLeft}s</span>
           </span>
        </div>

        {/* Retake Button - Style matched to the reference screenshot */}
        <div className="flex gap-4">
          <button
            onClick={onRetake}
            className="group flex items-center justify-center gap-4 px-12 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black rounded-[24px] shadow-[0_12px_30px_rgba(30,144,255,0.3)] border-b-4 border-blue-800 active:border-0 active:translate-y-1 transition-all duration-300 min-w-[280px]"
          >
            <RotateCcw className="w-7 h-7 group-hover:rotate-[-45deg] transition-transform" />
            <span className="text-xl uppercase tracking-widest brand-font">Retake Photo</span>
          </button>
        </div>
      </div>

      <style>{`
        @font-face {
          font-family: 'Lalezar';
          src: url('./Lalezar-Regular.ttf') format('truetype');
          font-weight: normal; font-style: normal;
        }
        .brand-font {
          font-family: 'Lalezar', cursive;
        }

        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-bottom {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards opacity(0);
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
