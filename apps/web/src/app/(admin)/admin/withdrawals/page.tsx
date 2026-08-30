'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface Withdrawal {
  _id: string;
  fundraiserId: string;
  fundraiserName: string;
  amount: number;
  status: string;
  bankName?: string;
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const { user, loading } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function fetchWithdrawals() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/withdrawals?limit=50`, { credentials: 'include' });
      const data = await res.json();
      setWithdrawals(data.data?.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function updateStatus(withdrawalId: string, status: string) {
    try {
      await fetch(`${getApiUrl()}/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchWithdrawals();
    } catch (error) {
      console.error('Failed to update withdrawal:', error);
    }
  }

  const pending = withdrawals.filter((w) => w.status === 'pending');
  const processed = withdrawals.filter((w) => w.status !== 'pending');

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <p className="text-muted-foreground">Process withdrawal requests</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((w) => (
              <Card key={w._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{w.fundraiserName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${w.amount.toLocaleString()} &middot; {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateStatus(w._id, 'approved')}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus(w._id, 'rejected')}
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {isDataLoading ? (
          <Card className="animate-pulse"><CardContent className="h-32" /></Card>
        ) : processed.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No withdrawal history</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {processed.map((w) => (
              <Card key={w._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{w.fundraiserName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${w.amount.toLocaleString()} &middot; {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={w.status === 'approved' ? 'default' : 'destructive'}>
                    {w.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
