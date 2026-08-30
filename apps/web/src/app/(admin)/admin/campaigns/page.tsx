'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';

interface Campaign {
  _id: string;
  title: string;
  status: string;
  fundraiserName: string;
  goalAmount: number;
  amountRaised: number;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
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

  async function fetchCampaigns() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/campaigns?limit=50`, { credentials: 'include' });
      const data = await res.json();
      setCampaigns(data.data?.campaigns || []);
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

  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.fundraiserName?.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">Review and manage campaigns</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <Card key={c._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{c.title}</h3>
                    <Badge
                      variant={
                        c.status === 'active'
                          ? 'default'
                          : c.status === 'completed'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {c.fundraiserName} &middot; ${c.amountRaised?.toLocaleString()} / ${c.goalAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/campaign/${c._id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                  </Link>
                  {c.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(c._id, 'active')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(c._id, 'rejected')}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </>
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
