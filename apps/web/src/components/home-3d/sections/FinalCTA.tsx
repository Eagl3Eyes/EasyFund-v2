'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative z-10 flex min-h-[80vh] items-center bg-gradient-to-b from-[#0a0f1a] to-[#0d1117]">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Start making an impact.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-400">
            Whether you want to support a cause or start your own campaign,
            EasyFund gives you everything you need to create real change.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#10B981] px-8 text-sm font-medium text-white shadow-lg shadow-[#10B981]/25 transition-all hover:bg-[#059669] hover:shadow-[#10B981]/40"
            >
              Explore Campaigns
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-8 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
            >
              Start a Campaign
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
