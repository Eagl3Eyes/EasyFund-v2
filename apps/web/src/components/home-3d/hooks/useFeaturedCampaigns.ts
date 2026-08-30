'use client';

import { useEffect, useState } from 'react';
import type { Campaign } from '@/lib/types';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';

const FALLBACK_CAMPAIGNS: Campaign[] = [
  {
    _id: '1', slug: 'clean-water-initiative', title: 'Clean Water Initiative',
    description: 'Providing clean drinking water to communities in need.',
    story: '', image: '', gallery: [], category: 'Environment',
    status: 'active', goal: 50000, amountRaised: 37500, supportersCount: 412,
    deadline: '2026-12-01', fundraiserId: '', fundraiserName: 'WaterAid Foundation',
    fundraiserImage: '', fundraiserVerified: true, beneficiaryType: 'community',
    milestones: [], updatesCount: 5, commentsCount: 23, riskScore: 10,
    reportCount: 0, featured: true, trending: true, createdAt: '2026-01-15', updatedAt: '2026-08-01',
  },
  {
    _id: '2', slug: 'education-for-all', title: 'Education for All',
    description: 'Building schools in underserved communities worldwide.',
    story: '', image: '', gallery: [], category: 'Education',
    status: 'active', goal: 80000, amountRaised: 56000, supportersCount: 634,
    deadline: '2026-11-15', fundraiserId: '', fundraiserName: 'Global Education Fund',
    fundraiserImage: '', fundraiserVerified: true, beneficiaryType: 'community',
    milestones: [], updatesCount: 8, commentsCount: 45, riskScore: 5,
    reportCount: 0, featured: true, trending: true, createdAt: '2026-02-10', updatedAt: '2026-08-05',
  },
  {
    _id: '3', slug: 'emergency-relief-fund', title: 'Emergency Relief Fund',
    description: 'Providing immediate aid during natural disasters.',
    story: '', image: '', gallery: [], category: 'Emergency',
    status: 'active', goal: 100000, amountRaised: 82000, supportersCount: 1203,
    deadline: '2026-10-30', fundraiserId: '', fundraiserName: 'Rapid Response Team',
    fundraiserImage: '', fundraiserVerified: true, beneficiaryType: 'organization',
    milestones: [], updatesCount: 12, commentsCount: 89, riskScore: 3,
    reportCount: 0, featured: true, trending: false, createdAt: '2026-03-05', updatedAt: '2026-08-10',
  },
  {
    _id: '4', slug: 'community-garden', title: 'Community Garden Project',
    description: 'Growing fresh food in urban neighborhoods.',
    story: '', image: '', gallery: [], category: 'Community',
    status: 'active', goal: 25000, amountRaised: 18750, supportersCount: 287,
    deadline: '2026-12-20', fundraiserId: '', fundraiserName: 'Green Spaces Collective',
    fundraiserImage: '', fundraiserVerified: false, beneficiaryType: 'community',
    milestones: [], updatesCount: 3, commentsCount: 15, riskScore: 8,
    reportCount: 0, featured: true, trending: false, createdAt: '2026-04-20', updatedAt: '2026-08-12',
  },
  {
    _id: '5', slug: 'youth-empowerment', title: 'Youth Empowerment Program',
    description: 'Mentoring and supporting the next generation of leaders.',
    story: '', image: '', gallery: [], category: 'Education',
    status: 'active', goal: 60000, amountRaised: 42000, supportersCount: 521,
    deadline: '2026-11-30', fundraiserId: '', fundraiserName: 'Future Leaders Inc.',
    fundraiserImage: '', fundraiserVerified: true, beneficiaryType: 'organization',
    milestones: [], updatesCount: 6, commentsCount: 34, riskScore: 12,
    reportCount: 0, featured: true, trending: true, createdAt: '2026-02-28', updatedAt: '2026-08-15',
  },
];

const CAMPAIGN_ACCENT_COLORS = ['#10B981', '#F59E0B', '#6366F1', '#10B981', '#F59E0B'];

export function useFeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        const res = await fetchWithTimeout(`${getApiUrl()}/api/campaigns/featured?limit=6`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!cancelled && data.success && data.data?.length > 0) {
          setCampaigns(data.data);
        } else if (!cancelled) {
          setCampaigns(FALLBACK_CAMPAIGNS);
        }
      } catch {
        if (!cancelled) setCampaigns(FALLBACK_CAMPAIGNS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  const colors = campaigns.map((_, i) => CAMPAIGN_ACCENT_COLORS[i % CAMPAIGN_ACCENT_COLORS.length]);

  return { campaigns, colors, loading };
}
