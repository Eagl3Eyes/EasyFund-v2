'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Plus } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';

interface Campaign {
  _id: string;
  title: string;
  status: string;
}

interface CampaignUpdate {
  _id: string;
  campaignId: string;
  campaignTitle: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function UpdatesPage() {
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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
      const res = await fetch(`${getApiUrl()}/api/campaigns?fundraiser=me&limit=50`, { credentials: 'include' });
      const data = await res.json();
      setCampaigns(data.data?.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCampaign || !title || !content) return;

    try {
      await fetch(`${getApiUrl()}/api/campaigns/${selectedCampaign}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      });
      setShowForm(false);
      setTitle('');
      setContent('');
      setSelectedCampaign('');
    } catch (error) {
      console.error('Failed to post update:', error);
    }
  }

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post Update</h1>
          <p className="text-muted-foreground">Share updates with your supporters</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> New Update
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign</Label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a campaign</option>
                  {activeCampaigns.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's new with your campaign?" rows={5} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Post Update</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isDataLoading ? (
        <Card className="animate-pulse"><CardContent className="h-32" /></Card>
      ) : activeCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You need an active campaign to post updates</p>
            <Link href="/dashboard/campaigns/new">
              <Button>Create Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
