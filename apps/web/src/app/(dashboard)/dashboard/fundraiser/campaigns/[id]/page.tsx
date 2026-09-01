'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Edit, Megaphone, DollarSign, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import type { Campaign } from '@/lib/types';

const statusColors: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  submitted: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  under_review: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  approved: 'bg-[#0ef695]/15 text-[#0ef695]',
  published: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
  active: 'bg-[#0ef695]/15 text-[#0ef695]',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
  suspended: 'bg-[#f97316]/15 text-[#f97316]',
  completed: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  cancelled: 'bg-white/10 text-white/40',
};

export default function CampaignManagementPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`${getApiUrl()}/api/campaigns/${params.id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          setCampaign(data.data);
        } else {
          toast.error('Campaign not found');
          router.push('/dashboard/fundraiser/campaigns');
        }
      } catch {
        toast.error('Failed to load campaign');
        router.push('/dashboard/fundraiser/campaigns');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchCampaign();
  }, [params.id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user || !campaign) return null;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fundraiser/campaigns" className="mb-6 inline-flex items-center text-sm text-white/55 hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Campaigns
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={statusColors[campaign.status] || ''}>{campaign.status}</Badge>
            <Badge variant="outline">{campaign.category}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaign/${campaign.slug}`}>
            <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> View</Button>
          </Link>
          {['draft', 'needs_information', 'rejected'].includes(campaign.status) && (
            <Link href={`/dashboard/fundraiser/campaigns/${campaign._id}/edit`}>
              <Button><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <DollarSign className="h-8 w-8 text-[#0ef695] mb-2" />
            <p className="text-2xl font-bold">${(campaign.amountRaised || 0).toLocaleString()}</p>
            <p className="text-sm text-white/55">of ${campaign.goal?.toLocaleString()} goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-[#0ef695] mb-2" />
            <p className="text-2xl font-bold">{campaign.supportersCount || 0}</p>
            <p className="text-sm text-white/55">supporters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Megaphone className="h-8 w-8 text-[#0ef695] mb-2" />
            <p className="text-2xl font-bold">{campaign.updatesCount || 0}</p>
            <p className="text-sm text-white/55">updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Calendar className="h-8 w-8 text-[#0ef695] mb-2" />
            <p className="text-2xl font-bold">
              {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline'}
            </p>
            <p className="text-sm text-white/55">deadline</p>
          </CardContent>
        </Card>
      </div>

      {campaign.description && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="text-white/55">{campaign.description}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
