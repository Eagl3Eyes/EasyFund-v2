'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useDeviceCapability } from './hooks/useDeviceCapability';
import { MobileFallback } from './MobileFallback';

const R3FCanvas = dynamic(() => import('./R3FCanvas').then((mod) => ({ default: mod.R3FCanvas })), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#0a0f1a] via-[#0d1929] to-[#0a1628]" />
  ),
});

export function HeroCanvas({ scrollProgress }: { scrollProgress: number }) {
  const prefersReduced = useReducedMotion();
  const capability = useDeviceCapability();

  if (prefersReduced || capability === 'low') {
    return <MobileFallback />;
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <Suspense fallback={<div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#0a0f1a] via-[#0d1929] to-[#0a1628]" />}>
        <R3FCanvas scrollProgress={scrollProgress} />
      </Suspense>
    </div>
  );
}
