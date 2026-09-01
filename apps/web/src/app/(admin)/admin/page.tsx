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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { getApiUrl } from '@/lib/config';

interface AdminStats {
  totals: {
    campaigns: number;
    donations: number;
    raised: number;
    users: number;
    pendingWithdrawals: number;
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
    },
    {
      title: 'Total Campaigns',
      value: stats?.totals.campaigns || 0,
      icon: Megaphone,
      color: 'bg-[#0ef695]/10 text-[#0ef695]',
    },
    {
      title: 'Total Raised',
      value: `$${(stats?.totals.raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Total Donations',
      value: stats?.totals.donations || 0,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-400',
    },
  ];

  const quickLinks = [
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/campaigns', label: 'Review Campaigns', icon: Megaphone },
    { href: '/admin/verification', label: 'Verification Requests', icon: CheckCircle },
    { href: '/admin/withdrawals', label: 'Withdrawal Requests', icon: DollarSign },
    { href: '/admin/risk', label: 'Risk Assessment', icon: AlertTriangle },
    { href: '/admin/payments', label: 'Payment History', icon: TrendingUp },
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        <h2 className="mb-4 border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
            >
              <Link href={link.href}>
                <Card variant="glow">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 shadow-[0_0_15px_rgba(14,246,149,0.1)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(14,246,149,0.2)]">
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
      </motion.div>
    </div>
  );
}
