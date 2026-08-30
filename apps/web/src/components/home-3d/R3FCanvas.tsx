'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3D } from './Scene3D';
import { ScrollCamera } from './components/ScrollCamera';

interface R3FCanvasProps {
  scrollProgress: number;
}

export function R3FCanvas({ scrollProgress }: R3FCanvasProps) {
  return (
    <div className="absolute inset-0 h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
        style={{ background: 'transparent' }}
      >
        <ScrollCamera scrollProgress={scrollProgress} />
        <Scene3D scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
