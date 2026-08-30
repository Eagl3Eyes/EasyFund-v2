'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { useFeaturedCampaigns } from '../hooks/useFeaturedCampaigns';

export function SectionFeatured() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { campaigns, loading } = useFeaturedCampaigns();

  if (loading) {
    return (
      <section ref={ref} className="relative z-10 bg-[#0a0f1a] py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="mx-auto mt-4 h-4 w-64 animate-pulse rounded bg-white/5" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="h-40 animate-pulse rounded-lg bg-white/5" />
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            Featured
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Campaigns making a real impact
          </h2>
          <p className="mt-3 text-gray-400">Discover campaigns with proven results</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.slice(0, 6).map((campaign, i) => {
            const progress = Math.min(100, Math.round((campaign.amountRaised / campaign.goal) * 100));
            return (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link
                  href={`/campaign/${campaign.slug}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/8"
                >
                  <div className="relative h-44 overflow-hidden bg-white/5">
                    {campaign.image ? (
                      <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl opacity-30">
                        {campaign.category === 'Education' ? '📚' : campaign.category === 'Emergency' ? '🆘' : campaign.category === 'Environment' ? '🌱' : '❤️'}
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                      {campaign.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-[#10B981] transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{campaign.description}</p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#10B981]">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                        <span className="text-gray-500">{progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#10B981] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {campaign.supportersCount} supporters · {campaign.fundraiserName}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            href="/explore"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-7 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
          >
            View All Campaigns
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
