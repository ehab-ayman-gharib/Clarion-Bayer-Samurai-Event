import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EraData } from '../types';
import { ERAS } from '../constants';

const { ipcRenderer } = window.require('electron');

const CFG = {
  CARD_W: 1.0,
  CARD_H: 1.5,
  CORNER_R: 0.04,
  ZOOM_IN_Z: 4.5,
  START_Z: -2,
  FOCUS_HOLD_MS: 4000,
  ANIM_SPEED: 2.0,
};

type Phase = 'zoom-in' | 'hold' | 'zoom-out';

function makeRoundedRectGeo(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) + w / 2) / w;
    uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geo;
}

const radialGlowTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 1)'); 
    gradient.addColorStop(0.4, 'rgba(0, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
})();

const Card: React.FC<{ url: string; fp: number }> = ({ url, fp }) => {
  const ref = useRef<THREE.Group>(null);
  const safePath = url.startsWith('http') ? url : `file:///${url.replace(/\\/g, '/')}`;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    new THREE.TextureLoader().load(safePath, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [safePath]);

  const imageGeo = useMemo(() => makeRoundedRectGeo(CFG.CARD_W, CFG.CARD_H, CFG.CORNER_R), []);

  useFrame(() => {
    if (!ref.current) return;
    // fp goes 0 -> 1 during zoom-in/out
    ref.current.position.z = CFG.START_Z + fp * (CFG.ZOOM_IN_Z - CFG.START_Z);
    ref.current.scale.setScalar(0.5 + fp * 0.5);
    ref.current.rotation.y = Math.sin(fp * Math.PI) * 0.1;
  });

  if (!texture) return null;
  return (
    <group ref={ref}>
      <mesh geometry={imageGeo}>
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[CFG.CARD_W * 2, CFG.CARD_H * 1.5]} />
        <meshBasicMaterial
          map={radialGlowTexture}
          transparent
          opacity={0.6 * fp}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ images: string[] }> = ({ images }) => {
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('zoom-in');
  const [fp, setFp] = useState(0);
  const timerRef = useRef(0);

  const shuffle = useCallback((list: string[]) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      setShuffled(shuffle(images));
      setCurrentIndex(0);
      setPhase('zoom-in');
      setFp(0);
    }
  }, [images, shuffle]);

  useFrame((_, delta) => {
    if (shuffled.length === 0) return;

    switch (phase) {
      case 'zoom-in': {
        const nextFp = Math.min(1, fp + delta * CFG.ANIM_SPEED);
        setFp(nextFp);
        if (nextFp >= 1) {
          setPhase('hold');
          timerRef.current = 0;
        }
        break;
      }
      case 'hold': {
        timerRef.current += delta * 1000;
        if (timerRef.current > CFG.FOCUS_HOLD_MS) {
          setPhase('zoom-out');
        }
        break;
      }
      case 'zoom-out': {
        const nextFp = Math.max(0, fp - delta * CFG.ANIM_SPEED);
        setFp(nextFp);
        if (nextFp <= 0) {
          const nextIdx = currentIndex + 1;
          if (nextIdx >= shuffled.length) {
            setShuffled(shuffle(images));
            setCurrentIndex(0);
          } else {
            setCurrentIndex(nextIdx);
          }
          setPhase('zoom-in');
        }
        break;
      }
    }
  });

  if (shuffled.length === 0) return null;

  return (
    <>
      <ambientLight intensity={1} />
      <Card url={shuffled[currentIndex]} fp={fp} />
    </>
  );
};

const CORNER_COLORS = ['#d4a853', '#53d4d4', '#d453a8', '#53d477', '#d4c953'];
const CORNERS = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 0, y: 100 },
  { x: 100, y: 100 },
];

const CornerParticles: React.FC = () => {
  const particles = useMemo(() => {
    const items: Array<{
      id: number; corner: number; size: number; duration: number;
      delay: number; dx: number; dy: number; color: string;
    }> = [];
    for (let i = 0; i < 80; i++) {
      const corner = i % 4;
      const signX = CORNERS[corner].x === 0 ? 1 : -1;
      const signY = CORNERS[corner].y === 0 ? 1 : -1;
      items.push({
        id: i,
        corner,
        size: 2 + Math.random() * 5,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 10,
        dx: signX * (20 + Math.random() * 30),
        dy: signY * (20 + Math.random() * 30),
        color: CORNER_COLORS[Math.floor(Math.random() * CORNER_COLORS.length)],
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes corner-burst {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          15% { opacity: 0.8; transform: translate(calc(var(--dx) * 0.15), calc(var(--dy) * 0.15)) scale(1); }
          85% { opacity: 0.3; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }
        @keyframes color-shift {
          0% { background: #d4a853; }
          25% { background: #53d4d4; }
          50% { background: #d453a8; }
          75% { background: #53d477; }
          100% { background: #d4a853; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${CORNERS[p.corner].x}%`,
            top: `${CORNERS[p.corner].y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            '--dx': `${p.dx}vw`,
            '--dy': `${p.dy}vh`,
            animation: `corner-burst ${p.duration}s ${p.delay}s infinite ease-out, color-shift ${p.duration * 2}s ${p.delay}s infinite linear`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export const ScreenSaver: React.FC<{ onDismiss: (era: EraData) => void }> = ({ onDismiss }) => {
  const [images, setImages] = useState<string[]>([]);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const { files } = await ipcRenderer.invoke('get-featured-info');
        if (files && files.length > 0) setImages(files);
        else setImages([]); // Handle empty list
      } catch (err) {
        console.warn('Failed to load featured images:', err);
        setImages([]);
      }
    };
    loadImages();

    const handleInteraction = () => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      
      // Select random era and dismiss
      const eraIndex = Math.floor(Math.random() * ERAS.length);
      onDismiss(ERAS[eraIndex]);
    };

    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 overflow-hidden cursor-none">
      <video
        autoPlay
        loop
        muted={true}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="./Intro.mp4"
      />

      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {images.length > 0 && <Scene images={images} />}
        </Canvas>

        <CornerParticles />

        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center pointer-events-none">
          <div
            className="text-5xl tracking-[0.5em] uppercase font-bold animate-pulse"
            style={{
              fontFamily: '"Cinzel", serif',
              color: 'rgba(0, 255, 255, 0.8)',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(0, 255, 255, 0.15)'
            }}
          >
            Tap to Start
          </div>
        </div>
      </div>
    </div>
  );
};
