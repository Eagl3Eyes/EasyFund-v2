'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Megaphone,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { getApiUrl } from '@/lib/config';
import { OverviewChart } from '@/components/charts/overview-chart';
import { CampaignStatusChart } from '@/components/charts/campaign-status-chart';

interface AdminStats {
  totals: {
    campaigns: number;
    donations: number;
    raised: number;
    users: number;
    pendingWithdrawals: number;
  };
  campaignStatusBreakdown: { _id: string; count: number }[];
  donationStatusBreakdown: { _id: string; count: number; totalAmount: number }[];
  userRoleBreakdown: { _id: string; count: number }[];
  monthly: {
    campaigns: { _id: number; count: number }[];
    donations: { _id: number; count: number; totalAmount: number }[];
    users: { _id: number; count: number }[];
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  submitted: '#f59e0b',
  under_review: '#3b82f6',
  approved: '#0ef695',
  active: '#10b981',
  completed: '#8b5cf6',
  rejected: '#ef4444',
  suspended: '#f97316',
  needs_information: '#fbbf24',
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/stats`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (user?.role === 'admin') {
      fetchStats();
    }
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

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 lg:p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-[#f59e0b]" />
        <h1 className="mt-4 text-2xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-white/50">You don&apos;t have admin access.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totals.users || 0,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400',
      change: stats?.monthly.users?.length ? `+${stats.monthly.users[stats.monthly.users.length - 1]?.count || 0} this month` : undefined,
    },
    {
      title: 'Total Campaigns',
      value: stats?.totals.campaigns || 0,
      icon: Megaphone,
      color: 'bg-[#0ef695]/10 text-[#0ef695]',
      change: stats?.monthly.campaigns?.length ? `+${stats.monthly.campaigns[stats.monthly.campaigns.length - 1]?.count || 0} this month` : undefined,
    },
    {
      title: 'Total Raised',
      value: `$${(stats?.totals.raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400',
      change: stats?.monthly.donations?.length ? `+$${(stats.monthly.donations[stats.monthly.donations.length - 1]?.totalAmount || 0).toLocaleString()} this month` : undefined,
    },
    {
      title: 'Total Donations',
      value: stats?.totals.donations || 0,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-400',
      change: stats?.monthly.donations?.length ? `+${stats.monthly.donations[stats.monthly.donations.length - 1]?.count || 0} this month` : undefined,
    },
  ];

  const donationChartData = stats?.monthly.donations
    ? MONTHS.map((name, i) => ({
        name,
        raised: stats.monthly.donations[i]?.totalAmount || 0,
        donations: stats.monthly.donations[i]?.count || 0,
      }))
    : [];

  const campaignStatusData = stats?.campaignStatusBreakdown
    ? stats.campaignStatusBreakdown.map((s) => ({
        name: s._id.replace(/_/g, ' '),
        value: s.count,
        color: STATUS_COLORS[s._id] || '#6b7280',
      }))
    : [];

  const userRoleData = stats?.userRoleBreakdown
    ? stats.userRoleBreakdown.map((s) => ({
        name: s._id,
        value: s.count,
        color: s._id === 'admin' ? '#0ef695' : s._id === 'fundraiser' ? '#8b5cf6' : '#3b82f6',
      }))
    : [];

  const quickLinks = [
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/campaigns', label: 'Review Campaigns', icon: Megaphone },
    { href: '/admin/verification', label: 'Verification Requests', icon: CheckCircle },
    { href: '/admin/withdrawals', label: 'Withdrawal Requests', icon: DollarSign },
    { href: '/admin/donations', label: 'Donations', icon: TrendingUp },
    { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Clock },
  ];

  return (
    <div className="relative p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px] rounded-full bg-[#0ef695]/[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-1.5 text-white/50">Platform overview and management</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.15]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/50">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.change && (
                  <p className="mt-1 text-xs text-[#0ef695]">{stat.change}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {stats?.totals.pendingWithdrawals ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/[0.04] p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
            <p className="text-sm font-medium text-[#f59e0b]">
              {stats.totals.pendingWithdrawals} pending withdrawal request(s)
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 grid gap-6 lg:grid-cols-2"
      >
        {/* Donation Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-[#0ef695]" />
              Donation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="h-[300px] animate-pulse rounded-lg bg-white/[0.06]" />
            ) : (
              <OverviewChart data={donationChartData} />
            )}
          </CardContent>
        </Card>

        {/* Campaign Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-[#0ef695]" />
              Campaign Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="h-[300px] animate-pulse rounded-lg bg-white/[0.06]" />
            ) : campaignStatusData.length > 0 ? (
              <CampaignStatusChart data={campaignStatusData} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-white/55">
                No campaign data yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Roles + Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 grid gap-6 lg:grid-cols-3"
      >
        {/* User Roles Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#0ef695]" />
              User Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.06]" />
                ))}
              </div>
            ) : userRoleData.length > 0 ? (
              <div className="space-y-4">
                {userRoleData.map((role) => (
                  <div key={role.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="text-sm font-medium capitalize text-white">{role.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{role.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/55">No user data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
              >
                <Link href={link.href}>
                  <Card variant="glow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0ef695]/10 shadow-[0_0_15px_rgba(14,246,149,0.1)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(14,246,149,0.2)]">
                          <link.icon className="h-5 w-5 text-[#0ef695]" />
                        </div>
                        <p className="font-semibold text-white">{link.label}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0ef695]" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
