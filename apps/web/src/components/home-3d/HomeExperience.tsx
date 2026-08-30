'use client';

import { useEffect, useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { HeroCanvas } from './HeroCanvas';
import { HeroText } from './sections/HeroText';
import { SectionDiscover } from './sections/SectionDiscover';
import { SectionContribute } from './sections/SectionContribute';
import { SectionProgress } from './sections/SectionProgress';
import { SectionTogether } from './sections/SectionTogether';
import { SectionTrust } from './sections/SectionTrust';
import { SectionImpact } from './sections/SectionImpact';
import { SectionFeatured } from './sections/SectionFeatured';
import { SectionHowItWorks } from './sections/SectionHowItWorks';
import { SectionCategories } from './sections/SectionCategories';
import { SectionSuccessStories } from './sections/SectionSuccessStories';
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

      {/* 3D Canvas — fixed behind hero + story arc */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: Math.min(1, canvasOpacity) }}
      >
        {showCanvas && <HeroCanvas scrollProgress={scrollProgress} />}
      </div>

      {/* Scrollable content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="relative h-screen">
          <HeroText />
        </section>

        {/* Story arc (3D scene visible behind these) */}
        <SectionDiscover />
        <SectionContribute />
        <SectionProgress />
        <SectionTogether />

        {/* Trust */}
        <SectionTrust />

        {/* Impact */}
        <SectionImpact />

        {/* 2D content sections */}
        <SectionFeatured />
        <SectionHowItWorks />
        <SectionCategories />
        <SectionSuccessStories />

        {/* Final CTA */}
        <FinalCTA />
      </div>
    </div>
  );
}
