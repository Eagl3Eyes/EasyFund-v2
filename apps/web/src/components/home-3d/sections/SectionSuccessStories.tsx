'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const stories = [
  {
    name: 'Sarah Mitchell',
    campaign: 'Community Library Project',
    quote: 'EasyFund helped us raise $45,000 in just 3 weeks. The support from our community was incredible.',
    raised: '$45,000',
    goal: '$50,000',
  },
  {
    name: 'James Rodriguez',
    campaign: 'Emergency Medical Fund',
    quote: 'When my daughter needed surgery, strangers from around the world stepped up. I will never forget their kindness.',
    raised: '$32,000',
    goal: '$30,000',
  },
  {
    name: 'Amira Osei',
    campaign: 'Clean Water for villages',
    quote: 'Our village finally has clean drinking water. This would not have been possible without EasyFund supporters.',
    raised: '$28,500',
    goal: '$25,000',
  },
];

export function SectionSuccessStories() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState(0);

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
            Stories
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Real people, real impact
          </h2>
        </motion.div>

        <div className="mt-12 mx-auto max-w-2xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <svg className="h-8 w-8 text-[#10B981]/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="mt-4 text-lg text-gray-300 italic leading-relaxed">
              &ldquo;{stories[active].quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{stories[active].name}</p>
                <p className="text-sm text-gray-500">{stories[active].campaign}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#10B981]">{stories[active].raised}</p>
                <p className="text-xs text-gray-500">of {stories[active].goal} goal</p>
              </div>
            </div>
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-[#10B981]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`View story ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
