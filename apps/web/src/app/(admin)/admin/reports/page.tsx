'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface Report {
  _id: string;
  reporterName: string;
  targetType: string;
  targetTitle: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

const API_URL = getApiUrl();

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchReports();
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

  async function fetchReports() {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports?limit=50`, { credentials: 'include' });
      const data = await res.json();
      setReports(data.data?.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
    try {
      await fetch(`${API_URL}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
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
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Review user-submitted reports</p>
      </div>

      {isDataLoading ? (
        <Card className="animate-pulse"><CardContent className="h-32" /></Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{r.reason}</Badge>
                      <Badge variant="outline">{r.targetType}</Badge>
                      <Badge variant={r.status === 'pending' ? 'secondary' : 'default'}>
                        {r.status}
                      </Badge>
                    </div>
                    <p className="font-medium mt-2">{r.targetTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reported by {r.reporterName} &middot; {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => resolveReport(r._id, 'resolved')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveReport(r._id, 'dismissed')}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
