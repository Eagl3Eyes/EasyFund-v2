'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { title: 'Total Raised', value: `$${analytics?.totalRaised?.toLocaleString() || '0'}`, icon: DollarSign, color: 'bg-[#0ef695]/10 text-[#0ef695]' },
    { title: 'Total Views', value: analytics?.totalViews?.toLocaleString() || '0', icon: Eye, color: 'bg-blue-500/10 text-blue-400' },
    { title: 'Unique Visitors', value: analytics?.uniqueVisitors?.toLocaleString() || '0', icon: Users, color: 'bg-purple-500/10 text-purple-400' },
    { title: 'Conversion Rate', value: `${analytics?.conversionRate?.toFixed(1) || '0'}%`, icon: TrendingUp, color: 'bg-orange-500/10 text-orange-400' },
    { title: 'Avg Donation', value: `$${analytics?.averageDonation?.toFixed(0) || '0'}`, icon: DollarSign, color: 'bg-pink-500/10 text-pink-400' },
  ];

  return (
    <div className="relative p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px] rounded-full bg-[#0ef695]/[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="mt-1.5 text-white/50">Track your campaign performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]" aria-label="Select time period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.15]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/50">{stat.title}</CardTitle>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <CardHeader>
              <CardTitle className="border-l-2 border-[#0ef695] pl-3">Views & Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="h-[300px] animate-pulse rounded-xl bg-white/[0.06]" />
              ) : analytics?.viewsByDay?.length ? (
                <CampaignStatsChart data={analytics.viewsByDay} />
              ) : (
                <p className="flex h-[300px] items-center justify-center text-white/40">No data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <CardHeader>
              <CardTitle className="border-l-2 border-[#0ef695] pl-3">Donation Amounts</CardTitle>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="h-[300px] animate-pulse rounded-xl bg-white/[0.06]" />
              ) : analytics?.donationsByDay?.length ? (
                <DonationChart data={analytics.donationsByDay} />
              ) : (
                <p className="flex h-[300px] items-center justify-center text-white/40">No data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
