'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroText() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Make a Difference.
          <br />
          <span className="text-[#10B981]">Fund What Matters.</span>
        </h1>
      </motion.div>

      <motion.p
        className="mt-6 max-w-2xl text-lg text-gray-400 md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        Support real people, meaningful causes, and communities that need your help.
        Every contribution creates lasting impact.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      >
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
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-gray-500"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
