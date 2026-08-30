'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const connections = [
  { from: 'People', to: 'Causes', color: '#10B981' },
  { from: 'Causes', to: 'Support', color: '#F59E0B' },
  { from: 'Support', to: 'Impact', color: '#6366F1' },
  { from: 'Impact', to: 'Community', color: '#10B981' },
];

export function SectionTogether() {
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
              Together
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Together, we create change.
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              When people come together around a shared cause,
              the impact multiplies. Join a global community making real difference.
            </p>
          </motion.div>

          <div className="mt-12">
            {/* Connection flow */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {connections.map((conn, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.12 * i }}
                >
                  <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                    <span className="font-semibold text-white">{conn.from}</span>
                  </div>
                  {i < connections.length - 1 && (
                    <svg className="hidden h-5 w-5 text-gray-600 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.12 * 4 }}
              >
                <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2 backdrop-blur-sm">
                  <span className="font-semibold text-[#10B981]">Impact</span>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {[
                { value: '10K+', label: 'Donors' },
                { value: '500+', label: 'Campaigns Funded' },
                { value: '$2M+', label: 'Total Raised' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 * i + 0.5 }}
                >
                  <p className="text-2xl font-bold text-[#10B981] sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
