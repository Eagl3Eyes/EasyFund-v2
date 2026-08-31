'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Eye, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignStatsChart } from '@/components/charts/campaign-stats-chart';
import { DonationChart } from '@/components/charts/donation-chart';
import { useAuth } from '@/providers/auth-provider';
import { getApiUrl } from '@/lib/config';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalDonations: number;
  averageDonation: number;
  conversionRate: number;
  totalRaised: number;
  viewsByDay: { name: string; views: number; donations: number }[];
  donationsByDay: { name: string; amount: number; count: number }[];
}

export default function FundraiserAnalyticsPage() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsDataLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/analytics/fundraiser?period=${period}d`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsDataLoading(false);
      }
    }
    if (user) fetchAnalytics();
  }, [user, period]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { title: 'Total Raised', value: `$${analytics?.totalRaised?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Total Views', value: analytics?.totalViews?.toLocaleString() || '0', icon: Eye, color: 'text-blue-500' },
    { title: 'Unique Visitors', value: analytics?.uniqueVisitors?.toLocaleString() || '0', icon: Users, color: 'text-purple-500' },
    { title: 'Conversion Rate', value: `${analytics?.conversionRate?.toFixed(1) || '0'}%`, icon: TrendingUp, color: 'text-orange-500' },
    { title: 'Avg Donation', value: `$${analytics?.averageDonation?.toFixed(0) || '0'}`, icon: DollarSign, color: 'text-pink-500' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Track your campaign performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views & Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="h-[300px] animate-pulse rounded bg-muted" />
            ) : analytics?.viewsByDay?.length ? (
              <CampaignStatsChart data={analytics.viewsByDay} />
            ) : (
              <p className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Donation Amounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="h-[300px] animate-pulse rounded bg-muted" />
            ) : analytics?.donationsByDay?.length ? (
              <DonationChart data={analytics.donationsByDay} />
            ) : (
              <p className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
