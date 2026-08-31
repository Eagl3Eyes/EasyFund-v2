'use client';

import { useEffect, useState } from 'react';
import { Users, Megaphone, DollarSign, TrendingUp, AlertTriangle, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { useAuth } from '@/providers/auth-provider';
import { getApiUrl } from '@/lib/config';

interface AdminOverview {
  totals: { users: number; campaigns: number; raised: number; donations: number; pendingWithdrawals: number; pendingVerifications: number; pendingReviews: number; reports: number };
  raisedByDay: { name: string; raised: number; donations: number }[];
}

export default function AdminOverviewPage() {
  const { user, loading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/stats`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) setOverview(data.data);
      } catch {} finally { setIsDataLoading(false); }
    }
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return null;

  const stats = [
    { title: 'Total Users', value: overview?.totals.users?.toLocaleString() || '0', icon: Users, color: 'text-blue-500' },
    { title: 'Total Campaigns', value: overview?.totals.campaigns?.toLocaleString() || '0', icon: Megaphone, color: 'text-green-500' },
    { title: 'Total Raised', value: `$${overview?.totals.raised?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-primary' },
    { title: 'Total Donations', value: overview?.totals.donations?.toLocaleString() || '0', icon: TrendingUp, color: 'text-purple-500' },
  ];

  const pendingItems = [
    { label: 'Pending Campaign Reviews', count: overview?.totals.pendingReviews || 0, icon: Megaphone, href: '/admin/campaigns' },
    { label: 'Pending Verifications', count: overview?.totals.pendingVerifications || 0, icon: Shield, href: '/admin/verification' },
    { label: 'Pending Withdrawals', count: overview?.totals.pendingWithdrawals || 0, icon: DollarSign, href: '/admin/withdrawals' },
    { label: 'Open Reports', count: overview?.totals.reports || 0, icon: AlertTriangle, href: '/admin/reports' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Overview</h1>
        <p className="mt-1 text-muted-foreground">Platform-wide metrics and status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{stat.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pendingItems.map((item) => (
          <Card key={item.label} className="border-[#f59e0b]/20 bg-[#f59e0b]/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-[#f59e0b]" />
                  <p className="text-sm text-[#f59e0b]">{item.label}</p>
                </div>
                <span className="text-lg font-bold text-[#f59e0b]">{item.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Platform Activity</CardTitle></CardHeader>
        <CardContent>
          {isDataLoading ? <div className="h-[300px] animate-pulse rounded bg-muted" /> : overview?.raisedByDay?.length ? <OverviewChart data={overview.raisedByDay} /> : <p className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</p>}
        </CardContent>
      </Card>
    </div>
  );
}
