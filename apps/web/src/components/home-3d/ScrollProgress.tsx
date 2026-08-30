'use client';

import { motion } from 'framer-motion';
import { useScrollProgress } from './hooks/useScrollProgress';

const sections = [
  'Hero',
  'Discover',
  'Contribute',
  'Progress',
  'Together',
  'Trust',
  'Impact',
  'Featured',
  'How It Works',
  'Categories',
  'Stories',
  'CTA',
];

export function ScrollProgress() {
  const scrollProgress = useScrollProgress();
  const activeIndex = Math.min(
    Math.floor(scrollProgress * sections.length),
    sections.length - 1
  );

  return (
    <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2">
      {sections.map((label, i) => (
        <div key={label} className="group relative flex items-center">
          <motion.div
            className="rounded-full transition-all duration-300"
            animate={{
              width: i === activeIndex ? 10 : 5,
              height: i === activeIndex ? 10 : 5,
              backgroundColor: i === activeIndex ? '#10B981' : i < activeIndex ? '#10B98160' : '#374151',
            }}
            transition={{ duration: 0.3 }}
          />
          <span className="absolute right-5 whitespace-nowrap text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
