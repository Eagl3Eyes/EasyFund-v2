'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AMOUNTS = [10, 25, 50, 100, 25, 50, 10, 100, 25, 50, 10, 25];
const ORBS_COUNT = AMOUNTS.length;

export function DonationRing({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const ringProgress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.2));
  }, [scrollProgress]);

  const orbs = useMemo(() => {
    return AMOUNTS.map((amount, i) => {
      const angle = (i / ORBS_COUNT) * Math.PI * 2;
      return { angle, amount };
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.003;
  });

  const radius = 2.5 * ringProgress;

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => {
        const x = Math.cos(orb.angle) * radius;
        const z = Math.sin(orb.angle) * radius;
        const isLarge = orb.amount >= 100;
        return (
          <mesh key={i} position={[x, 0, z]} scale={ringProgress * (isLarge ? 1.3 : 1)}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={isLarge ? '#10B981' : orb.amount >= 50 ? '#F59E0B' : '#6366F1'}
              emissive={isLarge ? '#10B981' : '#000000'}
              emissiveIntensity={isLarge ? 0.3 : 0}
              transparent
              opacity={ringProgress}
            />
          </mesh>
        );
      })}
    </group>
  );
}
