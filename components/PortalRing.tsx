import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PortalRingProps {
  size?: number;
}

export const PortalRing: React.FC<PortalRingProps> = ({ size = 480 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const W = size;
    const H = size;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;

    // ── Helper: glowing torus layer ───────────────────────────────────────
    const makeTorus = (radius: number, tube: number, color: number, opacity: number, speed: number) => {
      const geo = new THREE.TorusGeometry(radius, tube, 32, 200);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { speed, baseOpacity: opacity };
      return mesh;
    };

    const rings: THREE.Mesh[] = [];
    const baseRadius = 2.4;

    // Deep Indigo/Purple Nebula Background (Very soft and thick)
    rings.push(makeTorus(baseRadius, 0.55, 0x4400ff, 0.12, 0.4));
    rings.push(makeTorus(baseRadius, 0.65, 0x1a0088, 0.08, -0.3));

    // Deep Electric Blue Core (Main body of the ring)
    rings.push(makeTorus(baseRadius, 0.18, 0x1a3fff, 0.5, 1.2));
    rings.push(makeTorus(baseRadius, 0.22, 0x0044ff, 0.3, -0.8));

    // Bright Cyan Accents (Energetic highlights)
    rings.push(makeTorus(baseRadius * 1.01, 0.05, 0x00ffff, 0.7, 2.5));
    rings.push(makeTorus(baseRadius * 0.99, 0.03, 0x88ffff, 0.5, -3.2));

    // Bright White Central Core (Pure energy focus)
    rings.push(makeTorus(baseRadius, 0.04, 0xffffff, 0.9, 1.8));

    // Purple Energy Trails
    rings.push(makeTorus(baseRadius * 1.05, 0.08, 0x8800ff, 0.2, 0.6));

    rings.forEach(r => scene.add(r));

    // ── Swirling Plasma Particles ────────────────────────────────────────
    const particleCount = 450;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const colors = [
        new THREE.Color(0x1a3fff), // Deep Blue
        new THREE.Color(0x00ffff), // Cyan
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x8800ff)  // Purple
    ];

    for (let i = 0; i < particleCount; i++) {
        const radius = baseRadius + (Math.random() - 0.5) * 1.5;
        const angle = Math.random() * Math.PI * 2;
        posArray[i * 3] = Math.cos(angle) * radius;
        posArray[i * 3 + 1] = Math.sin(angle) * radius;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

        const col = colors[Math.floor(Math.random() * colors.length)];
        colorArray[i * 3] = col.r;
        colorArray[i * 3 + 1] = col.g;
        colorArray[i * 3 + 2] = col.b;
    }

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const partMat = new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false
    });

    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // ── Animation Loop ────────────────────────────────────────────────────
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.016;

      rings.forEach((r, i) => {
        const speed = r.userData.speed as number;
        r.rotation.z = time * speed;
        r.rotation.x = Math.sin(time * 0.3 + i) * 0.08;
        r.rotation.y = Math.cos(time * 0.2 + i) * 0.08;
        
        const baseOpacity = r.userData.baseOpacity as number;
        (r.material as THREE.MeshBasicMaterial).opacity = baseOpacity * (0.8 + Math.sin(time * 2 + i) * 0.2);
      });

      particles.rotation.z = time * 0.4;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      partGeo.dispose();
      partMat.dispose();
      rings.forEach(r => {
        if (r.geometry) r.geometry.dispose();
        if (r.material) (r.material as THREE.Material).dispose();
      });
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className="flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
};
