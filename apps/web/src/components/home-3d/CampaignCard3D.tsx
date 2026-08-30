'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CampaignCard3DProps {
  index: number;
  scrollProgress: number;
  title: string;
  color: string;
}

export function CampaignCard3D({ index, scrollProgress, title, color }: CampaignCard3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const spreadProgress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.1) / 0.2));
  }, [scrollProgress]);

  const cardCount = 5;
  const angle = ((index - (cardCount - 1) / 2) / cardCount) * Math.PI * 0.6;
  const radius = 3 + spreadProgress * 2;
  const x = Math.sin(angle) * radius * spreadProgress;
  const y = Math.cos(angle) * 0.8 - 0.5;
  const z = -2 + Math.cos(angle) * radius * 0.5 * spreadProgress;

  const baseRotation = angle * 0.3;
  const scale = 0.6 + spreadProgress * 0.4;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = y + Math.sin(t * 0.8 + index) * 0.08;
    meshRef.current.rotation.y = baseRotation + Math.sin(t * 0.3 + index * 0.5) * 0.05;
  });

  return (
    <group>
      <mesh ref={meshRef} position={[x, y, z]} rotation={[0, baseRotation, 0]} scale={scale}>
        <boxGeometry args={[1.8, 1.2, 0.05]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.05}
          transparent
          opacity={spreadProgress * 0.95}
        />
      </mesh>

      <mesh position={[x, y + 0.5, z + 0.03]} rotation={[0, baseRotation, 0]} scale={[scale * 1.8 * 0.98, scale * 0.08, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} transparent opacity={spreadProgress * 0.9} />
      </mesh>

      <mesh position={[x - 0.3, y + 0.25, z + 0.03]} rotation={[0, baseRotation, 0]} scale={[scale * 1.1, scale * 0.05, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={spreadProgress * 0.5} />
      </mesh>

      <mesh position={[x - 0.5, y - 0.35, z + 0.03]} rotation={[0, baseRotation, 0]} scale={[scale * 0.8, scale * 0.03, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={spreadProgress * 0.4} />
      </mesh>
      <mesh position={[x - 0.5 + 0.4 * spreadProgress, y - 0.35, z + 0.035]} rotation={[0, baseRotation, 0]} scale={[scale * 0.8 * spreadProgress * 0.65, scale * 0.03, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#10B981" transparent opacity={spreadProgress * 0.9} />
      </mesh>
    </group>
  );
}
