'use client';

import { useEffect, useState } from 'react';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';

interface PlatformStats {
  totalRaised: number;
  totalCampaigns: number;
  totalDonations: number;
  totalUsers: number;
}

export function TrustStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetchWithTimeout(`${getApiUrl()}/api/stats`);
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch {
        // Fallback to zero stats
        setStats({ totalRaised: 0, totalCampaigns: 0, totalDonations: 0, totalUsers: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  function formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M+`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K+`;
    }
    return `$${amount.toLocaleString()}`;
  }

  function formatNumber(num: number): string {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0).replace(/\.0$/, '')},000+`;
    }
    return num.toLocaleString();
  }

  if (loading) {
    return (
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="mx-auto h-8 w-24 rounded bg-muted" />
              <div className="mx-auto mt-2 h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="border-y bg-muted/50 py-12">
      <div className="container mx-auto grid grid-cols-2 gap-8 md:grid-cols-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{formatCurrency(stats?.totalRaised || 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total Raised</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{formatNumber(stats?.totalCampaigns || 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Active Campaigns</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{formatNumber(stats?.totalDonations || 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Donations Made</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{formatNumber(stats?.totalUsers || 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Community Members</p>
        </div>
      </div>
    </section>
  );
}
