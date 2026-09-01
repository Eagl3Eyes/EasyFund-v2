'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ExternalLink } from 'lucide-react';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { useAuth } from '@/providers/auth-provider';
import type { Campaign } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

export default function FollowingPage() {
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowing() {
      try {
        const res = await fetch(`${getApiUrl()}/api/follows/following/campaigns?limit=50`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setCampaigns(data.data || []);
      } catch (error) {
        console.error('Failed to fetch following:', error);
      } finally {
        setIsDataLoading(false);
      }
    }
    if (user) fetchFollowing();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Following</h1>
        <p className="mt-1 text-white/55">Campaigns from fundraisers you follow</p>
      </div>

      {isDataLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-white/55" />
          <p className="mt-4 text-lg font-medium text-white">Not following anyone yet</p>
          <p className="mt-2 text-white/55">Follow fundraisers to see their campaigns here</p>
          <Link href="/explore">
            <Button className="mt-4">Explore Campaigns</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Button } from '@/components/ui/button';
