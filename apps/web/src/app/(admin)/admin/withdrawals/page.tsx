'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, DollarSign, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getApiUrl } from '@/lib/config';

interface Withdrawal {
  _id: string;
  fundraiserId: string;
  fundraiserName: string;
  amount: number;
  status: string;
  bankName?: string;
  accountNumber?: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, string> = {
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  approved: 'bg-[#0ef695]/15 text-[#0ef695]',
  processing: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  completed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function AdminWithdrawalsPage() {
  const { user, loading } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => { fetchWithdrawals(); }, []);

  const pending = withdrawals.filter((w) => w.status === 'pending');
  const totalPending = pending.reduce((sum, w) => sum + w.amount, 0);

  const filtered = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchSearch = w.fundraiserName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [withdrawals, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user?.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  async function fetchWithdrawals() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/withdrawals?limit=100`, { credentials: 'include' });
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <p className="text-muted-foreground">Process withdrawal requests</p>
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#f59e0b]" />
              <div>
                <p className="font-medium text-[#f59e0b]">{pending.length} pending request(s)</p>
                <p className="text-sm text-[#f59e0b]">Total: ${totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by fundraiser..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isDataLoading ? (
        <Card className="animate-pulse"><CardContent className="h-32" /></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No withdrawals found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fundraiser</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{w.fundraiserName}</p>
                      {w.bankName && <p className="text-xs text-muted-foreground">{w.bankName}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${w.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_VARIANT[w.status] || ''}>{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {w.status === 'pending' ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#0ef695] hover:text-[#0ef695]/80" onClick={() => updateStatus(w._id, 'approved')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#ef4444] hover:text-[#ef4444]/80" onClick={() => updateStatus(w._id, 'rejected')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
