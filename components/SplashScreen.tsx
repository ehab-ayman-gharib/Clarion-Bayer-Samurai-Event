import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EraData } from '../types';
import { ERAS } from '../constants';

interface SplashScreenProps {
  onStart: () => void;
  onSelectEra: (era: EraData) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

let lastEraIndex = -1;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onSelectEra, isMuted, setIsMuted }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  const unmuteVideo = () => {
    if (videoRef.current && isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  const handleInteraction = () => {
    unmuteVideo();
  };

  const handleVideoEnded = () => {
    setIsVideoFinished(true);
  };

  const handleStartJourney = () => {
    if (isExitingRef.current) return;

    setIsExiting(true);
    isExitingRef.current = true;

    // Select random era with anti-consecutive repetition
    let eraIndex;
    if (ERAS.length > 1) {
      do {
        eraIndex = Math.floor(Math.random() * ERAS.length);
      } while (eraIndex === lastEraIndex);
    } else {
      eraIndex = 0;
    }
    lastEraIndex = eraIndex;

    const randomEra = ERAS[eraIndex];

    setTimeout(() => {
      onSelectEra(randomEra);
    }, 1800);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    // ... scene setup remains same ...
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 10;
    camera.position.y = 0;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 800;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const futuristicColors = [new THREE.Color(0x00ffff), new THREE.Color(0xff00ff), new THREE.Color(0x60a5fa)];
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 40;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 40;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const color = futuristicColors[Math.floor(Math.random() * futuristicColors.length)];
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(0, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.Texture(canvas); particleTexture.needsUpdate = true;
    const particlesMat = new THREE.PointsMaterial({ size: 0.12, map: particleTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;
      const isExitingNow = isExitingRef.current;
      particleSystem.rotation.y = time * 0.05;
      particleSystem.rotation.x = time * 0.02;
      if (isExitingNow) {
        particlesMat.opacity -= 0.02;
        camera.position.z -= 0.1;
      } else {
        camera.position.x = Math.sin(time * 0.2) * 0.5;
        camera.position.y = Math.cos(time * 0.1) * 0.5;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.innerHTML = '';
      renderer.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full relative overflow-hidden bg-black" onClick={handleInteraction}>
      {/* Background Layer */}
      <div className={`absolute inset-0 transition-all duration-[1800ms] ease-in-out ${isExiting ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100'}`}>
        
        {/* Still Image - Always present but hidden behind the video initially */}
        <img 
          src="./Intro-Still.png" 
          alt="Intro Still" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isVideoFinished ? 'opacity-100' : 'opacity-0'}`} 
        />

        {/* Video Layer - Fades out once finished */}
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleVideoEnded}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isVideoFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          src="./Intro.mp4"
        />
      </div>

      {/* Button Layer */}
      {isVideoFinished && !isExiting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center animate-scale-in">
          <button
            onClick={handleStartJourney}
            className="focus:outline-none hover:scale-105 active:scale-75 transition-transform duration-300 transform"
          >
            <img
              src="./New-Journey-Btn.png"
              alt="Start Journey"
              className="max-w-[450px] drop-shadow-[0_0_30px_rgba(0,183,255,0.5)]"
            />
          </button>
        </div>
      )}

      {/* Particles Layer */}
      <div ref={mountRef} className="absolute inset-0 z-[5] pointer-events-none" />

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};