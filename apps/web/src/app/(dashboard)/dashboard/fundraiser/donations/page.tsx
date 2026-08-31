'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import type { Donation } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

export default function FundraiserDonationsPage() {
  const { user, loading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch(`${getApiUrl()}/api/donations/fundraiser?limit=50`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setDonations(data.data || []);
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const totalReceived = donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Donations Received</h1>
        <p className="mt-1 text-muted-foreground">Donations to your campaigns</p>
      </div>

      <div className="mb-6 rounded-lg bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">Total Received</p>
        <p className="text-2xl font-bold text-primary">${totalReceived.toLocaleString()}</p>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-foreground">No donations yet</p>
          <p className="mt-2 text-muted-foreground">Donations will appear here once supporters contribute</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => (
            <div key={donation._id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                {statusIcons[donation.status]}
                <div>
                  <p className="font-medium text-foreground">{donation.userName || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {donation.campaignTitle} &middot; {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">${donation.amount}</p>
                <Badge className={statusColors[donation.status] || ''}>{donation.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
