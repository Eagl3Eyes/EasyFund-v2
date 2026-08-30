'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VerificationBadge } from '@/components/campaign/verification-badge';
import { CampaignProgress } from '@/components/campaign/campaign-progress';
import { DonationFlow } from '@/components/campaign/donation-flow';
import { CommentThread } from '@/components/campaign/comment-thread';
import { Skeleton } from '@/components/ui/skeleton';
import type { Campaign } from '@/lib/types';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getTimeRemaining(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
  return 'Ending soon';
}

interface CampaignDetailClientProps {
  slug: string;
}

export function CampaignDetailClient({ slug }: CampaignDetailClientProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetchWithTimeout(`${getApiUrl()}/api/campaigns/${slug}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCampaign(data.data);
        } else {
          setError('Campaign not found');
        }
      } catch {
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchCampaign();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">{error || 'Campaign not found'}</p>
        <Link href="/explore" className="mt-4 inline-flex text-primary hover:underline">
          Browse all campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {campaign.image && (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{campaign.category}</Badge>
              {campaign.location && (
                <span className="flex items-center text-sm text-muted-foreground">
                  {campaign.location}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-foreground">{campaign.title}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {campaign.fundraiserName?.charAt(0) || 'F'}
              </div>
              <div>
                <p className="font-medium text-foreground">{campaign.fundraiserName}</p>
                <div className="flex items-center gap-1">
                  <VerificationBadge level={campaign.fundraiserVerified ? 'full' : 'none'} />
                  <span className="text-xs text-muted-foreground">Fundraiser</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold text-foreground">About This Campaign</h2>
            <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
              {campaign.story || campaign.description}
            </p>
          </div>

          {campaign.milestones && campaign.milestones.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground">Milestones</h2>
              <div className="mt-4 space-y-3">
                {campaign.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      milestone.reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {milestone.reached ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{milestone.label}</p>
                      <p className="text-sm text-muted-foreground">{milestone.percentage}% of goal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <CommentThread campaignId={campaign._id} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <CampaignProgress raised={campaign.amountRaised} goal={campaign.goal} />
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{campaign.supportersCount}</p>
                <p className="text-sm text-muted-foreground">Supporters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {getTimeRemaining(campaign.deadline)}
                </p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </div>

          <DonationFlow
            campaignId={campaign._id}
            campaignTitle={campaign.title}
            fundraiserName={campaign.fundraiserName}
          />

          <Button variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share Campaign
          </Button>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">Campaign Details</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Goal</dt>
                <dd className="text-sm font-medium text-foreground">{formatCurrency(campaign.goal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Raised</dt>
                <dd className="text-sm font-medium text-primary">{formatCurrency(campaign.amountRaised)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd className="text-sm font-medium text-foreground capitalize">{campaign.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd className="text-sm font-medium text-foreground">{formatDate(campaign.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Deadline</dt>
                <dd className="text-sm font-medium text-foreground">{formatDate(campaign.deadline)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
