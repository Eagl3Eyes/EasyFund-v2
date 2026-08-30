'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Ban, Eye, Users, Megaphone } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface AdminStats {
  totals: {
    users: number;
    campaigns: number;
    donations: number;
    pendingWithdrawals: number;
  };
}

export default function AdminTrustSafetyPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  async function fetchStats() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/stats`, { credentials: 'include' });
      const data = await res.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

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
        <h1 className="text-3xl font-bold">Trust & Safety</h1>
        <p className="text-muted-foreground">Platform safety metrics and guidelines</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDataLoading ? '...' : stats?.totals.users || 0}</p>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDataLoading ? '...' : stats?.totals.campaigns || 0}</p>
            <p className="text-xs text-muted-foreground">Published campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDataLoading ? '...' : stats?.totals.pendingWithdrawals || 0}</p>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Safety Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Eye className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Campaign Review</p>
              <p className="text-sm text-muted-foreground">
                All campaigns are reviewed before going live. Check for authentic images, clear goals, and genuine fundraising purposes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Fraud Detection</p>
              <p className="text-sm text-muted-foreground">
                Monitor for suspicious donation patterns, duplicate campaigns, and misleading information. Report concerns immediately.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Ban className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">User Suspension</p>
              <p className="text-sm text-muted-foreground">
                Users who violate platform policies may be suspended. All suspensions are logged in the audit trail.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
