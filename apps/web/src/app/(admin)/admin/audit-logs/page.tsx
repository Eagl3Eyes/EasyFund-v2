'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
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

  async function fetchLogs() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/audit-logs?limit=50`, { credentials: 'include' });
      const data = await res.json();
      setLogs(data.data?.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
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
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions</p>
      </div>

      {isDataLoading ? (
        <Card className="animate-pulse"><CardContent className="h-32" /></Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit logs yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm text-muted-foreground">{log.targetType}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {log.performedBy} &middot; {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
