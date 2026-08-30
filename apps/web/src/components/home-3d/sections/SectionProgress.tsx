'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const stages = [
  { percent: 25, label: 'Getting Started', color: '#6366F1' },
  { percent: 50, label: 'Halfway There', color: '#F59E0B' },
  { percent: 75, label: 'Almost There', color: '#10B981' },
  { percent: 100, label: 'Fully Funded', color: '#10B981' },
];

export function SectionProgress() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStage, setActiveStage] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      setActiveStage(i);
      i++;
      if (i >= stages.length) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section ref={ref} className="relative z-10 flex min-h-screen items-center">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">
              Progress
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Watch an idea become impact.
            </h2>
          </motion.div>

          <div className="mt-12 space-y-6">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.percent}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * i }}
              >
                <div className="w-16 text-right">
                  <span className="text-sm font-bold" style={{ color: i <= activeStage ? stage.color : '#4B5563' }}>
                    {stage.percent}%
                  </span>
                </div>
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stage.color }}
                    initial={{ width: '0%' }}
                    animate={i <= activeStage ? { width: `${stage.percent}%` } : { width: '0%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="w-40 text-left">
                  <span className="text-sm" style={{ color: i <= activeStage ? '#ffffff' : '#6B7280' }}>
                    {stage.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {activeStage >= 3 && (
            <motion.div
              className="mt-8 flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Goal Reached</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
