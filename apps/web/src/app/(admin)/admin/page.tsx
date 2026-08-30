'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 lg:p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You don&apos;t have admin access.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totals.users || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Campaigns',
      value: stats?.totals.campaigns || 0,
      icon: Megaphone,
      color: 'text-green-500',
    },
    {
      title: 'Total Raised',
      value: `$${(stats?.totals.raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Total Donations',
      value: stats?.totals.donations || 0,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  const quickLinks = [
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/campaigns', label: 'Review Campaigns', icon: Megaphone },
    { href: '/admin/verification', label: 'Verification Requests', icon: CheckCircle },
    { href: '/admin/withdrawals', label: 'Withdrawal Requests', icon: DollarSign },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.totals.pendingWithdrawals ? (
        <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm font-medium text-yellow-700">
              {stats.totals.pendingWithdrawals} pending withdrawal request(s)
            </p>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">{link.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
