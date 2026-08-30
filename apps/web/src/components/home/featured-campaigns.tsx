'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
          <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="mt-12 text-center text-muted-foreground">
        <p>No campaigns available yet. Be the first to start one!</p>
        <Link
          href="/auth/register"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start a Campaign
        </Link>
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
