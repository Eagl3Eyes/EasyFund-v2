'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CommunityParticles } from './CommunityParticles';
import { CampaignCard3D } from './CampaignCard3D';
import { DonationRing } from './DonationRing';
import { ProgressConstellation } from './ProgressConstellation';

const CAMPAIGN_COLORS = ['#10B981', '#F59E0B', '#6366F1', '#10B981', '#F59E0B'];
const CAMPAIGN_TITLES = [
  'Clean Water Initiative',
  'Education for All',
  'Emergency Relief Fund',
  'Community Garden',
  'Youth Empowerment',
];

export function Scene3D({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      scrollProgress * 0.1,
      0.05
    );
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#10B981" />
      <pointLight position={[0, 2, 4]} intensity={0.4} color="#F59E0B" />

      <mesh position={[0, 0, -8]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#0a0f1a"
          side={THREE.BackSide}
        />
      </mesh>

      <group ref={groupRef}>
        {CAMPAIGN_TITLES.map((title, i) => (
          <CampaignCard3D
            key={i}
            index={i}
            scrollProgress={scrollProgress}
            title={title}
            color={CAMPAIGN_COLORS[i]}
          />
        ))}

        <DonationRing scrollProgress={scrollProgress} />

        <ProgressConstellation scrollProgress={scrollProgress} />
      </group>

      <CommunityParticles scrollProgress={scrollProgress} />
    </>
  );
}
