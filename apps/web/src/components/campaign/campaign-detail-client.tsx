'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Flag, Copy, Check, Twitter, Facebook, Link as LinkIcon, Clock, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VerificationBadge } from '@/components/campaign/verification-badge';
import { CampaignProgress } from '@/components/campaign/campaign-progress';
import { CampaignGallery } from '@/components/campaign/campaign-gallery';
import { DonationFlow } from '@/components/donation/donation-flow';
import { CommentThread } from '@/components/campaign/comment-thread';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Campaign } from '@/lib/types';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';

interface CampaignUpdate {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
}

interface Supporter {
  _id: string;
  donorName: string;
  amount: number;
  createdAt: string;
  message?: string;
}

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);

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

  useEffect(() => {
    if (!campaign?._id) return;
    fetch(`${getApiUrl()}/api/campaigns/${campaign._id}/updates`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUpdates(d.data || []); })
      .catch(() => {});
    fetch(`${getApiUrl()}/api/donations/campaign/${campaign._id}/supporters`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSupporters(d.data || []); })
      .catch(() => {});
  }, [campaign?._id]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const shareTwitter = useCallback(() => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(campaign?.title || 'Support this campaign')}`, '_blank');
  }, [shareUrl, campaign]);

  const shareFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }, [shareUrl]);

  const handleReport = useCallback(async () => {
    if (!campaign) return;
    const reason = prompt('Why are you reporting this campaign?\n(e.g., fraud, inappropriate content, spam)');
    if (!reason) return;
    try {
      await fetch(`${getApiUrl()}/api/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'campaign',
          targetId: campaign._id,
          reason: 'other',
          description: reason,
        }),
      });
      toast.success('Report submitted. Our team will review it.');
    } catch {
      toast.error('Failed to submit report');
    }
  }, [campaign]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6 bg-white/10" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-8 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-white/55">{error || 'Campaign not found'}</p>
        <Link href="/explore" className="mt-4 inline-flex text-[#0ef695] hover:underline">
          Browse all campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {campaign.gallery && campaign.gallery.length > 0 ? (
            <CampaignGallery images={campaign.gallery} title={campaign.title} />
          ) : campaign.image ? (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-[#071324]/80 backdrop-blur-sm text-white/80 border-white/[0.08]">{campaign.category}</Badge>
              {campaign.location && (
                <span className="flex items-center text-sm text-white/55">
                  {campaign.location}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">{campaign.title}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
                {campaign.fundraiserName?.charAt(0) || 'F'}
              </div>
              <div>
                <p className="font-medium text-white">{campaign.fundraiserName}</p>
                <div className="flex items-center gap-1">
                  <VerificationBadge level={campaign.fundraiserVerified ? 'full' : 'none'} />
                  <span className="text-xs text-white/40">Fundraiser</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/[0.08]" />

          <div>
            <h2 className="text-xl font-semibold text-white">About This Campaign</h2>
            <p className="mt-4 whitespace-pre-line text-white/55 leading-relaxed">
              {campaign.story || campaign.description}
            </p>
          </div>

          {campaign.milestones && campaign.milestones.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white">Milestones</h2>
              <div className="mt-4 space-y-3">
                {campaign.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.08] p-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      milestone.reached ? 'bg-[#0ef695] text-[#060e1e]' : 'bg-white/10 text-white/50'
                    }`}>
                      {milestone.reached ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{milestone.label}</p>
                      <p className="text-sm text-white/55">{milestone.percentage}% of goal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {updates.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white">Campaign Updates</h2>
              <div className="mt-4 space-y-4">
                {updates.map((update) => (
                  <div key={update._id} className="rounded-lg border border-white/[0.08] bg-[#0c1828] p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{update.title}</h3>
                      <span className="flex items-center text-xs text-white/40">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/55">{update.content}</p>
                    {update.authorName && (
                      <p className="mt-2 text-xs text-white/40">Posted by {update.authorName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {supporters.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Supporters</h2>
              <div className="mt-4 space-y-3">
                {supporters.slice(0, 10).map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-lg border border-white/[0.08] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                        {s.donorName?.charAt(0) || <UserIcon className="h-4 w-4 text-white/50" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.donorName}</p>
                        {s.message && <p className="text-xs text-white/40">{s.message}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#0ef695]">{formatCurrency(s.amount)}</p>
                      <p className="text-xs text-white/40">{formatDate(s.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-white/[0.08]" />

          <CommentThread campaignId={campaign._id} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-6 shadow-sm">
            <CampaignProgress raised={campaign.amountRaised} goal={campaign.goal} />
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{campaign.supportersCount}</p>
                <p className="text-sm text-white/55">Supporters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {getTimeRemaining(campaign.deadline)}
                </p>
                <p className="text-sm text-white/55">Remaining</p>
              </div>
            </div>
          </div>

          <DonationFlow
            campaignId={campaign._id}
            campaignTitle={campaign.title}
            fundraiserName={campaign.fundraiserName}
          />

          <div className="relative">
            <button onClick={() => setShowShareMenu(!showShareMenu)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
              <Share2 className="h-4 w-4" />
              Share Campaign
            </button>
            {showShareMenu && (
              <div className="absolute top-full left-0 right-0 z-10 mt-2 rounded-xl border border-white/[0.08] bg-[#0c1828] p-2 shadow-lg">
                <button onClick={copyLink} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  {copied ? <Check className="h-4 w-4 text-[#0ef695]" /> : <LinkIcon className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button onClick={shareTwitter} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" /> Twitter
                </button>
                <button onClick={shareFacebook} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4" /> Facebook
                </button>
              </div>
            )}
          </div>

          <button onClick={handleReport} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/5 hover:text-white/70" aria-label="Report campaign">
            <Flag className="h-4 w-4" />
            Report Campaign
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-6 shadow-sm">
            <h3 className="font-semibold text-white">Campaign Details</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-white/55">Goal</dt>
                <dd className="text-sm font-medium text-white">{formatCurrency(campaign.goal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-white/55">Raised</dt>
                <dd className="text-sm font-medium text-[#0ef695]">{formatCurrency(campaign.amountRaised)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-white/55">Category</dt>
                <dd className="text-sm font-medium text-white capitalize">{campaign.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-white/55">Created</dt>
                <dd className="text-sm font-medium text-white">{formatDate(campaign.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-white/55">Deadline</dt>
                <dd className="text-sm font-medium text-white">{formatDate(campaign.deadline)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
