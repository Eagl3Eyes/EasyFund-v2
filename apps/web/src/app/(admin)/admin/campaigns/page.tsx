'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, ArrowUpDown, Megaphone, Clock, AlertTriangle, Ban } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';

interface Campaign {
  _id: string;
  title: string;
  status: string;
  fundraiserName: string;
  goal: number;
  amountRaised: number;
  category?: string;
  createdAt: string;
}

type SortField = 'title' | 'goal' | 'amountRaised' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const STATUS_OPTIONS = ['all', 'submitted', 'under_review', 'approved', 'active', 'completed', 'rejected', 'suspended', 'draft', 'needs_information'];

const STATUS_VARIANT: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  submitted: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  under_review: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  approved: 'bg-[#0ef695]/15 text-[#0ef695]',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
  suspended: 'bg-[#f97316]/15 text-[#f97316]',
  needs_information: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-white/10 text-white/40',
};

export default function AdminCampaignsPage() {
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    campaigns.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    return { total: campaigns.length, byStatus };
  }, [campaigns]);

  const filtered = useMemo(() => {
    let result = campaigns.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.fundraiserName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'goal':
          comparison = a.goal - b.goal;
          break;
        case 'amountRaised':
          comparison = a.amountRaised - b.amountRaised;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [campaigns, search, statusFilter, sortField, sortDir]);

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

  async function fetchCampaigns() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/campaigns?limit=100`, { credentials: 'include' });
      const data = await res.json();
      setCampaigns(data.data || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function updateStatus(campaignId: string, status: string) {
    try {
      await fetch(`${getApiUrl()}/api/admin/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  }

  async function bulkUpdateStatus(status: string) {
    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`${getApiUrl()}/api/admin/campaigns/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status }),
          })
        )
      );
      setSelectedIds(new Set());
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to bulk update:', error);
    } finally {
      setBulkActionLoading(false);
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c._id)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-white/55">Review and manage campaigns</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-[#0ef695]" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/55">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-[#f59e0b]" />
              <div>
                <p className="text-2xl font-bold">{(stats.byStatus['submitted'] || 0) + (stats.byStatus['under_review'] || 0)}</p>
                <p className="text-sm text-white/55">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{(stats.byStatus['active'] || 0) + (stats.byStatus['approved'] || 0)}</p>
                <p className="text-sm text-white/55">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{(stats.byStatus['rejected'] || 0) + (stats.byStatus['suspended'] || 0)}</p>
                <p className="text-sm text-white/55">Rejected / Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/55">{selectedIds.size} selected</span>
            <Button size="sm" variant="default" disabled={bulkActionLoading} onClick={() => bulkUpdateStatus('approved')}>
              <CheckCircle className="mr-1 h-3 w-3" /> Approve
            </Button>
            <Button size="sm" variant="destructive" disabled={bulkActionLoading} onClick={() => bulkUpdateStatus('rejected')}>
              <XCircle className="mr-1 h-3 w-3" /> Reject
            </Button>
            <Button size="sm" variant="outline" disabled={bulkActionLoading} onClick={() => bulkUpdateStatus('suspended')}>
              <Ban className="mr-1 h-3 w-3" /> Suspend
            </Button>
          </div>
        )}
      </motion.div>

      {/* Table */}
      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-16" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-white/55 mb-4" />
            <p className="text-white/55">No campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>
                  Campaign <SortIcon field="title" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('goal')}>
                  Goal <SortIcon field="goal" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('amountRaised')}>
                  Raised <SortIcon field="amountRaised" />
                </TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  Created <SortIcon field="createdAt" />
                </TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const progress = c.goal > 0 ? Math.min(100, Math.round((c.amountRaised / c.goal) * 100)) : 0;
                return (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(c._id)}
                        onCheckedChange={() => toggleSelect(c._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-white/55">by {c.fundraiserName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_VARIANT[c.status] || ''}>{c.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>${c.goal?.toLocaleString()}</TableCell>
                    <TableCell>${c.amountRaised?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full bg-[#0ef695] rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-white/55">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-white/55">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/campaign/${c._id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {c.status === 'submitted' && (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#0ef695] hover:text-[#0ef695]/80" onClick={() => updateStatus(c._id, 'approved')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#ef4444] hover:text-[#ef4444]/80" onClick={() => updateStatus(c._id, 'rejected')}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {c.status === 'active' && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#f97316] hover:text-[#f97316]/80" onClick={() => updateStatus(c._id, 'suspended')}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
