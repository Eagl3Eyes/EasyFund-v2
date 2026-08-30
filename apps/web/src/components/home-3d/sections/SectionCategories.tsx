'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

const categories = [
  { name: 'Education', slug: 'education', icon: '📚', color: '#3B82F6' },
  { name: 'Health', slug: 'health', icon: '❤️', color: '#EF4444' },
  { name: 'Community', slug: 'community', icon: '👥', color: '#10B981' },
  { name: 'Emergency', slug: 'emergency', icon: '🆘', color: '#F59E0B' },
  { name: 'Environment', slug: 'environment', icon: '🌱', color: '#6366F1' },
  { name: 'Animals', slug: 'animals', icon: '🐾', color: '#EC4899' },
  { name: 'Nonprofit', slug: 'nonprofit', icon: '💜', color: '#8B5CF6' },
  { name: 'Personal', slug: 'personal', icon: '❤️', color: '#06B6D4' },
];

export function SectionCategories() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative z-10 bg-[#0a0f1a] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">
            Categories
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Explore causes you care about
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 * i }}
            >
              <Link
                href={`/explore?category=${cat.slug}`}
                className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8"
                style={{ perspective: '600px' }}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">{cat.icon}</span>
                <span className="text-sm font-medium text-white">{cat.name}</span>
                <span
                  className="h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-12"
                  style={{ backgroundColor: cat.color }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
