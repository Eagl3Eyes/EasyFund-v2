'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import type { Donation } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const statusColors: Record<string, string> = {
  completed: 'bg-[#0ef695]/15 text-[#0ef695]',
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  failed: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function DonationsPage() {
  const { user, loading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch(`${getApiUrl()}/api/donations/user/${user?.email}?limit=50`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setDonations(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch donations:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (user) fetchDonations();
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

  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Donations</h1>
        <p className="mt-1 text-white/55">Track your donation history</p>
      </div>

      <div className="mb-6 rounded-lg bg-[#0ef695]/5 p-4">
        <p className="text-sm text-white/55">Total Donated</p>
        <p className="text-2xl font-bold text-[#0ef695]">${totalDonated.toLocaleString()}</p>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/[0.06]" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <p className="text-lg font-medium text-white">No donations yet</p>
          <p className="mt-2 text-white/55">Your donation history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => (
            <div key={donation._id} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0c1828] p-4">
              <div>
                <p className="font-medium text-white">{donation.campaignTitle}</p>
                <p className="text-sm text-white/55">
                  {new Date(donation.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0ef695]">${donation.amount}</p>
                <Badge className={statusColors[donation.status] || ''}>
                  {donation.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
