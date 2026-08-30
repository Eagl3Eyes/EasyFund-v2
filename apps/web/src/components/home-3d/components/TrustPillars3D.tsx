'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrustPillars3DProps {
  scrollProgress: number;
}

const PILLAR_COLORS = ['#10B981', '#F59E0B', '#6366F1'];
const PILLAR_LABELS = ['Identity Verified', 'Payment Secure', 'Campaign Reviewed'];

export function TrustPillars3D({ scrollProgress }: TrustPillars3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  const revealProgress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.55) / 0.1));
  }, [scrollProgress]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = revealProgress * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Central hub */}
      <mesh position={[0, 0, 0]} scale={revealProgress * 0.5}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.5}
          transparent
          opacity={revealProgress}
        />
      </mesh>

      {/* Three pillars */}
      {PILLAR_COLORS.map((color, i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const radius = 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const pillarProgress = Math.max(0, Math.min(1, (revealProgress - i * 0.15) * 2));

        return (
          <group key={i}>
            {/* Pillar column */}
            <mesh position={[x, pillarProgress * 0.8, z]} scale={[0.15, pillarProgress * 1.6, 0.15]}>
              <cylinderGeometry args={[1, 1, 1, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                transparent
                opacity={pillarProgress * 0.9}
              />
            </mesh>

            {/* Pillar cap */}
            <mesh position={[x, pillarProgress * 1.7, z]} scale={pillarProgress * 0.2}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
                transparent
                opacity={pillarProgress}
              />
            </mesh>

            {/* Connection line (thin cylinder from hub to pillar) */}
            <mesh
              position={[x * 0.5, 0, z * 0.5]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[revealProgress, 0.01, 0.01]}
            >
              <cylinderGeometry args={[1, 1, 1, 4]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.2}
                transparent
                opacity={revealProgress * 0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
