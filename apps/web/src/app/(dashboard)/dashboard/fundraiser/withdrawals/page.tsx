'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import type { Withdrawal } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  processing: <Clock className="h-4 w-4 text-yellow-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  completed: 'bg-[#0ef695]/15 text-[#0ef695]',
  approved: 'bg-[#0ef695]/15 text-[#0ef695]',
  processing: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function WithdrawalsPage() {
  const { user, loading } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const res = await fetch(`${getApiUrl()}/api/users/withdrawals?limit=50`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setWithdrawals(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (user) fetchWithdrawals();
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

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
        <p className="mt-1 text-white/55">Track your withdrawal requests</p>
      </div>

      <div className="mb-6 rounded-lg bg-[#0ef695]/5 p-4">
        <p className="text-sm text-white/55">Total Withdrawn</p>
        <p className="text-2xl font-bold text-[#0ef695]">${totalWithdrawn.toLocaleString()}</p>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/[0.06]" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-white/55" />
          <p className="mt-4 text-lg font-medium text-white">No withdrawals yet</p>
          <p className="mt-2 text-white/55">
            Withdrawals will appear here once you request them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0c1828] p-4">
              <div className="flex items-center gap-3">
                {statusIcons[withdrawal.status]}
                <div>
                  <p className="font-medium text-white">{withdrawal.campaignTitle}</p>
                  <p className="text-sm text-white/55">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0ef695]">${withdrawal.amount}</p>
                <Badge className={statusColors[withdrawal.status] || ''}>
                  {withdrawal.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
