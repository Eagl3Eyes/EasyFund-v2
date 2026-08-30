'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CommunityParticles } from './CommunityParticles';
import { CampaignCard3D } from './CampaignCard3D';
import { DonationRing } from './DonationRing';
import { ProgressConstellation } from './ProgressConstellation';
import { NetworkLines } from './components/NetworkLines';
import { TrustPillars3D } from './components/TrustPillars3D';
import { ImpactCategories3D } from './components/ImpactCategories3D';

const CAMPAIGN_COLORS = ['#10B981', '#F59E0B', '#6366F1', '#10B981', '#F59E0B'];
const CAMPAIGN_TITLES = [
  'Clean Water Initiative',
  'Education for All',
  'Emergency Relief Fund',
  'Community Garden',
  'Youth Empowerment',
];

export function Scene3D({ scrollProgress }: { scrollProgress: number }) {
  const rotatingGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!rotatingGroupRef.current) return;
    rotatingGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      rotatingGroupRef.current.rotation.y,
      scrollProgress * 0.15,
      0.04
    );
  });

  return (
    <>
      {/* ═══ WORLD-SPACE atmosphere (NOT inside rotating group) ═══ */}

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0f1a', 6, 20]} />

      {/* Cinematic 3-point lighting */}
      <ambientLight intensity={0.4} />
      {/* Key — warm white from right-front */}
      <directionalLight position={[5, 4, 5]} intensity={0.9} color="#ffffff" />
      {/* Fill — emerald from left */}
      <directionalLight position={[-4, 3, 2]} intensity={0.35} color="#10B981" />
      {/* Rim — amber from behind */}
      <pointLight position={[0, 3, -5]} intensity={0.5} color="#F59E0B" distance={15} />
      {/* Accent — indigo from below for depth */}
      <pointLight position={[0, -2, 3]} intensity={0.2} color="#6366F1" distance={10} />

      {/* Background sphere (far behind) */}
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial color="#0a0f1a" side={THREE.BackSide} />
      </mesh>

      {/* Background gradient plane (behind sphere for subtle depth) */}
      <mesh position={[0, 0, -15]} scale={[30, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#0d1929" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* ═══ SCROLL-DRIVEN content (inside rotating group) ═══ */}

      <group ref={rotatingGroupRef}>
        {/* Campaign cards */}
        {CAMPAIGN_TITLES.map((title, i) => (
          <CampaignCard3D
            key={i}
            index={i}
            scrollProgress={scrollProgress}
            title={title}
            color={CAMPAIGN_COLORS[i]}
          />
        ))}

        {/* Network lines connecting cards */}
        <NetworkLines scrollProgress={scrollProgress} />

        {/* Donation ring */}
        <DonationRing scrollProgress={scrollProgress} />

        {/* Progress constellation */}
        <ProgressConstellation scrollProgress={scrollProgress} />

        {/* Trust pillars */}
        <TrustPillars3D scrollProgress={scrollProgress} />

        {/* Impact categories */}
        <ImpactCategories3D scrollProgress={scrollProgress} />
      </group>

      {/* Community particles (world-space, independent of rotation) */}
      <CommunityParticles scrollProgress={scrollProgress} />
    </>
  );
}
