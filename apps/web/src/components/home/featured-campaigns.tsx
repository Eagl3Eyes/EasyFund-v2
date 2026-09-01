'use client';

import { useEffect, useState } from 'react';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Campaign } from '@/lib/types';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';

export function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetchWithTimeout(`${getApiUrl()}/api/campaigns/featured?limit=6`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.08] bg-card shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full bg-white/5" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-white/10" />
              <Skeleton className="h-3 w-full bg-white/10" />
              <Skeleton className="h-2 w-full bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-white/55">No campaigns available yet. Be the first to start one!</p>
        <a
          href="/auth/register"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-6 py-3 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8]"
        >
          Start a Campaign
        </a>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign._id || campaign.slug} campaign={campaign} />
      ))}
    </div>
  );
}
