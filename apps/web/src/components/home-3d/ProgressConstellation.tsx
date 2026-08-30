'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ProgressConstellation({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const barRef = useRef<THREE.Mesh>(null);

  const progress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.5) / 0.25));
  }, [scrollProgress]);

  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 1.5 + Math.random() * 1.5;
      return {
        x: Math.cos(angle) * r,
        y: (Math.random() - 0.5) * 2,
        z: Math.sin(angle) * r,
        scale: 0.05 + Math.random() * 0.08,
      };
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = progress * Math.PI * 0.5;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => {
        const nodeProgress = Math.max(0, Math.min(1, (progress - i * 0.05) * 2));
        return (
          <mesh
            key={i}
            position={[node.x * nodeProgress, node.y * nodeProgress, node.z * nodeProgress]}
            scale={node.scale * nodeProgress}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#F59E0B' : '#6366F1'}
              emissive={i % 3 === 0 ? '#10B981' : '#000000'}
              emissiveIntensity={0.4}
              transparent
              opacity={nodeProgress * 0.8}
            />
          </mesh>
        );
      })}

      <mesh ref={barRef} position={[0, -1.8, 0]} scale={[3 * progress, 0.08, 0.08]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={progress === 1 ? 0.8 : 0.3}
          transparent
          opacity={progress}
        />
      </mesh>

      {progress >= 0.99 && (
        <mesh position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
          <torusGeometry args={[1.2, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
