'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 120;

export function CommunityParticles({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const col = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color('#10B981'),
      new THREE.Color('#F59E0B'),
      new THREE.Color('#6366F1'),
    ];
    for (let i = 0; i < COUNT; i++) {
      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3 + 1] += Math.sin(Date.now() * 0.0005 + i) * delta * 0.08;
      posAttr.array[i * 3] += Math.cos(Date.now() * 0.0003 + i * 0.5) * delta * 0.05;
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = scrollProgress * 0.3;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
