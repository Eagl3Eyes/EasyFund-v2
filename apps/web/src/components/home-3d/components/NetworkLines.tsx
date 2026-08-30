'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkLinesProps {
  scrollProgress: number;
}

export function NetworkLines({ scrollProgress }: NetworkLinesProps) {
  const lineProgress = useMemo(() => {
    return Math.max(0, Math.min(1, (scrollProgress - 0.15) / 0.1));
  }, [scrollProgress]);

  const cardCount = 5;
  const radius = 3;
  const positions = useMemo(() => {
    return Array.from({ length: cardCount }, (_, i) => {
      const angle = ((i - (cardCount - 1) / 2) / cardCount) * Math.PI * 0.6;
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        Math.cos(angle) * 0.8 - 0.5,
        -2 + Math.cos(angle) * radius * 0.5
      );
    });
  }, []);

  const linePairs = useMemo(() => {
    const pairs: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    const colors = ['#10B981', '#F59E0B', '#6366F1'];
    for (let i = 0; i < positions.length - 1; i++) {
      pairs.push({
        start: positions[i],
        end: positions[i + 1],
        color: colors[i % colors.length],
      });
    }
    // Connect middle to ends for a hub feel
    const mid = Math.floor(positions.length / 2);
    for (let i = 0; i < positions.length; i++) {
      if (i !== mid) {
        pairs.push({
          start: positions[mid],
          end: positions[i],
          color: '#10B981',
        });
      }
    }
    return pairs;
  }, [positions]);

  if (lineProgress < 0.01) return null;

  return (
    <group>
      {linePairs.map((pair, i) => (
        <Line
          key={i}
          points={[pair.start, pair.end]}
          color={pair.color}
          lineWidth={1}
          transparent
          opacity={lineProgress * 0.3}
        />
      ))}
    </group>
  );
}
