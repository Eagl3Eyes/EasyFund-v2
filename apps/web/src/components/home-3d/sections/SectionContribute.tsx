'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const amounts = [
  { value: 10, label: '$10', description: 'Provides school supplies' },
  { value: 25, label: '$25', description: 'Feeds a family for a week' },
  { value: 50, label: '$50', description: 'Covers medical checkup' },
  { value: 100, label: '$100', description: 'Funds clean water access' },
];

export function SectionContribute() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative z-10 flex min-h-screen items-center">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">
              Support
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Every contribution counts.
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              No amount is too small. Your support directly impacts real lives.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {amounts.map((amount, i) => (
              <motion.div
                key={amount.value}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#10B981]/50 hover:bg-[#10B981]/5"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <p className="text-3xl font-bold text-[#10B981]">{amount.label}</p>
                <p className="mt-2 text-sm text-gray-400">{amount.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
