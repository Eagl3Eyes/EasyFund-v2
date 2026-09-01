'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/auth-provider';
import type { Donation } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  pending: <Clock className="h-4 w-4 text-[#f59e0b]" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  completed: 'bg-[#0ef695]/15 text-[#0ef695]',
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  failed: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const [payments, setPayments] = useState<Donation[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/payments?limit=100`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setPayments(data.data || []);
      } catch {} finally { setIsDataLoading(false); }
    }
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" /></div>;
  if (!user) return null;

  const filtered = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.userName?.toLowerCase().includes(search.toLowerCase()) && !p.campaignTitle?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalVolume = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Payment History</h1>
        <p className="mt-1 text-white/55">All transactions across the platform</p>
      </div>

      <div className="mb-6 rounded-lg bg-[#0ef695]/5 p-4">
        <p className="text-sm text-white/55">Total Payment Volume</p>
        <p className="text-2xl font-bold text-[#0ef695]">${totalVolume.toLocaleString()}</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
          <Input placeholder="Search by donor or campaign..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-white/[0.06]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-white/55" />
          <p className="mt-4 text-lg font-medium text-white">No payments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-white/55">
                <th className="pb-3 font-medium">Donor</th>
                <th className="pb-3 font-medium">Campaign</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-white">{p.userName || 'Anonymous'}</td>
                  <td className="py-3 text-white/55">{p.campaignTitle}</td>
                  <td className="py-3 font-semibold text-[#0ef695]">${p.amount}</td>
                  <td className="py-3"><Badge className={statusColors[p.status] || ''}>{p.status}</Badge></td>
                  <td className="py-3 text-white/55">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
