'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function SectionDiscover() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative z-10 flex min-h-screen items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">
              Discover
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              There&apos;s always a cause
              <br />
              <span className="text-[#10B981]">worth supporting.</span>
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              Browse campaigns from people and communities around the world.
              Find a cause that speaks to you and make a difference today.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
