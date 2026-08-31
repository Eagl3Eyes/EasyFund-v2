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
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  published: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !campaign) return null;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fundraiser/campaigns" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
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
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">${(campaign.amountRaised || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">of ${campaign.goal?.toLocaleString()} goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{campaign.supportersCount || 0}</p>
            <p className="text-sm text-muted-foreground">supporters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Megaphone className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{campaign.updatesCount || 0}</p>
            <p className="text-sm text-muted-foreground">updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">
              {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline'}
            </p>
            <p className="text-sm text-muted-foreground">deadline</p>
          </CardContent>
        </Card>
      </div>

      {campaign.description && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{campaign.description}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
