'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ImpactCategories3DProps {
  scrollProgress: number;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#F59E0B', '#10B981',
  '#6366F1', '#EC4899', '#8B5CF6', '#06B6D4',
];

export function ImpactCategories3D({ scrollProgress }: ImpactCategories3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  const revealProgress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.65) / 0.1));
  }, [scrollProgress]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {CATEGORY_COLORS.map((color, i) => {
        const phi = Math.acos(-1 + (2 * i) / CATEGORY_COLORS.length);
        const theta = Math.sqrt(CATEGORY_COLORS.length * Math.PI) * phi;
        const radius = 2.2;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        const orbProgress = Math.max(0, Math.min(1, (revealProgress - i * 0.08) * 2));

        return (
          <mesh
            key={i}
            position={[x * orbProgress, y * orbProgress, z * orbProgress]}
            scale={orbProgress * 0.18}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              transparent
              opacity={orbProgress * 0.85}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Central hub */}
      <mesh scale={revealProgress * 0.25}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.6}
          transparent
          opacity={revealProgress * 0.7}
        />
      </mesh>
    </group>
  );
}
