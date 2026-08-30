'use client';

import { useEffect, useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { HeroCanvas } from './HeroCanvas';
import { HeroText } from './sections/HeroText';
import { SectionDiscover } from './sections/SectionDiscover';
import { SectionContribute } from './sections/SectionContribute';
import { SectionProgress } from './sections/SectionProgress';
import { SectionTogether } from './sections/SectionTogether';
import { FinalCTA } from './sections/FinalCTA';
import { ScrollProgress } from './ScrollProgress';

export function HomeExperience() {
  const scrollProgress = useScrollProgress();
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  const canvasOpacity = Math.max(0, 1 - (scrollProgress - 0.7) / 0.2);

  return (
    <div className="relative">
      <ScrollProgress />

      {/* 3D Canvas Section — fixed background behind hero + story */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: Math.min(1, canvasOpacity) }}
      >
        {showCanvas && <HeroCanvas scrollProgress={scrollProgress} />}
      </div>

      {/* Scrollable content overlay */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="relative h-screen">
          <HeroText />
        </section>

        {/* Story sections */}
        <SectionDiscover />
        <SectionContribute />
        <SectionProgress />
        <SectionTogether />

        {/* CTA + 2D content */}
        <FinalCTA />
      </div>
    </div>
  );
}
