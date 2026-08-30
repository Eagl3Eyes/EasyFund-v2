'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, Stars } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/* =========================================================
   SCROLL PROGRESS HOOK
========================================================= */

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setProgress(Math.max(0, Math.min(1, value)));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}

/* =========================================================
   CLEAN AMBIENT 3D BACKGROUND
   (No Drei HTML popups that clash with the UI)
========================================================= */

export default function EasyFund3DScene() {
  const progress = useScrollProgress();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Canvas
        dpr={mobile ? [1, 1.2] : [1, 1.6]}
        camera={{
          position: [0, 0, 7],
          fov: 45,
        }}
        gl={{
          antialias: !mobile,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#050c18']} />
        <fog attach="fog" args={['#050c18', 6, 18]} />

        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={2} />

        <pointLight
          position={[-4, 3, 4]}
          intensity={15}
          distance={14}
          color="#48df79"
        />

        <pointLight
          position={[4, -3, 3]}
          intensity={10}
          distance={12}
          color="#38bdf8"
        />

        {/* Ambient Stars & Twinkling Sparkles */}
        {!mobile && (
          <>
            <Stars
              radius={40}
              depth={25}
              count={700}
              factor={2.5}
              fade
              speed={0.4}
            />

            <Sparkles
              count={90}
              scale={[15, 12, 8]}
              size={1.8}
              speed={0.3}
              opacity={0.35}
              color="#48df79"
            />
          </>
        )}

        {/* Floating Low-Poly Space Rocks */}
        <FloatingRocks progress={progress} />
      </Canvas>
    </div>
  );
}

/* =========================================================
   FLOATING LOW-POLY 3D ROCKS (matching reference design)
========================================================= */

function FloatingRocks({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const rockPositions = useMemo(
    () => [
      { pos: [-4.2, 2.5, -1], scale: 0.28, speed: 0.8 },
      { pos: [-3.8, -1.8, 0], scale: 0.22, speed: 1.1 },
      { pos: [4.5, 3.2, -2], scale: 0.35, speed: 0.7 },
      { pos: [5.2, 0.8, -1], scale: 0.26, speed: 1.0 },
      { pos: [4.0, -2.5, 0], scale: 0.32, speed: 0.9 },
      { pos: [-5.0, 0.5, -2], scale: 0.2, speed: 1.2 },
    ],
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;

    // Subtle parallax on scroll
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      -progress * 2.5,
      2,
      delta
    );

    group.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <group ref={group}>
      {rockPositions.map((r, i) => (
        <Float
          key={i}
          speed={r.speed}
          rotationIntensity={0.4}
          floatIntensity={0.6}
        >
          <mesh position={r.pos as [number, number, number]} scale={r.scale}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
