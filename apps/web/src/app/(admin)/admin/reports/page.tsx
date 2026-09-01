'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const STATUS_VARIANT: Record<string, string> = {
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  resolved: 'bg-[#0ef695]/15 text-[#0ef695]',
  dismissed: 'bg-white/10 text-white/50',
};

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = r.targetTitle.toLowerCase().includes(search.toLowerCase()) || r.reporterName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user || user?.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/55">Access Denied</p>
      </div>
    );
  }

  async function fetchReports() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/reports?limit=100`, { credentials: 'include' });
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
      await fetch(`${getApiUrl()}/api/admin/reports/${reportId}`, {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-white/55">Review user-submitted reports</p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
              <p className="font-medium text-[#f59e0b]">{pendingCount} pending report(s) requiring review</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isDataLoading ? (
        <Card className="animate-pulse"><CardContent className="h-32" /></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-white/55 mb-4" />
            <p className="text-white/55">No reports found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    <div>
                      <Badge variant="destructive" className="text-xs">{r.reason}</Badge>
                      <p className="font-medium mt-1 text-sm">{r.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{r.targetTitle}</p>
                      <p className="text-xs text-white/55">{r.targetType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_VARIANT[r.status] || ''}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.reporterName}</TableCell>
                  <TableCell className="text-sm text-white/55">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.status === 'pending' ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-[#0ef695]" onClick={() => resolveReport(r._id, 'resolved')}>
                          <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => resolveReport(r._id, 'dismissed')}>
                          <XCircle className="mr-1 h-3 w-3" /> Dismiss
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/55">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
