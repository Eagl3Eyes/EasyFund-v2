'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import type { Campaign } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const statusColors: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  submitted: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  active: 'bg-[#0ef695]/15 text-[#0ef695]',
  completed: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function MyCampaignsPage() {
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`${getApiUrl()}/api/campaigns?fundraiserId=${user?._id}&limit=50`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (user) fetchCampaigns();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Campaigns</h1>
          <p className="mt-1 text-white/55">Manage your fundraising campaigns</p>
        </div>
        <Link href="/dashboard/fundraiser/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/[0.06]" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <p className="text-lg font-medium text-white">No campaigns yet</p>
          <p className="mt-2 text-white/55">Create your first campaign to start raising funds</p>
          <Link href="/dashboard/fundraiser/campaigns/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0c1828] p-4">
              <div className="flex items-center gap-4">
                {campaign.image && (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <Link
                    href={`/campaign/${campaign.slug}`}
                    className="font-medium text-white hover:text-[#0ef695]"
                  >
                    {campaign.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={statusColors[campaign.status] || ''}>
                      {campaign.status}
                    </Badge>
                    <span className="text-sm text-white/55">
                      ${campaign.amountRaised?.toLocaleString()} / ${campaign.goal?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/campaign/${campaign.slug}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                {campaign.status === 'draft' && (
                  <Link href={`/dashboard/fundraiser/campaigns/${campaign._id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
