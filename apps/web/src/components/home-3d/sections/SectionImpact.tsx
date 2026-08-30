'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const categories = [
  { name: 'Education', icon: '📚', color: '#3B82F6' },
  { name: 'Medical', icon: '🏥', color: '#EF4444' },
  { name: 'Emergency', icon: '🆘', color: '#F59E0B' },
  { name: 'Community', icon: '👥', color: '#10B981' },
  { name: 'Environment', icon: '🌱', color: '#6366F1' },
  { name: 'Animals', icon: '🐾', color: '#EC4899' },
  { name: 'Nonprofit', icon: '💜', color: '#8B5CF6' },
  { name: 'Personal', icon: '❤️', color: '#06B6D4' },
];

export function SectionImpact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative z-10 flex min-h-screen items-center bg-[#0a0f1a]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">
              Impact
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Where your support
              <br />
              <span className="text-[#10B981]">makes the biggest difference.</span>
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              From education to emergency relief, your contribution reaches the causes you care about most.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat, i) => (
              <motion.a
                key={cat.name}
                href={`/explore?category=${cat.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium text-white">{cat.name}</span>
                <span className="h-0.5 w-8 rounded-full transition-all group-hover:w-12" style={{ backgroundColor: cat.color }} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
