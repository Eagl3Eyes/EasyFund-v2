'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

const categories = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'environment', label: 'Environment' },
  { value: 'arts-culture', label: 'Arts & Culture' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'animals', label: 'Animals' },
  { value: 'other', label: 'Other' },
];

interface CampaignData {
  _id: string;
  title: string;
  description: string;
  story: string;
  category: string;
  location: string;
  goal: number;
  deadline: string;
  image: string;
  status: string;
  fundraiserId: string;
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    location: '',
    goal: 0,
    deadline: '',
    image: '',
  });

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`${getApiUrl()}/api/campaigns/${params.id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          const c = data.data;
          setCampaign(c);
          setFormData({
            title: c.title || '',
            description: c.description || '',
            story: c.story || '',
            category: c.category || '',
            location: c.location || '',
            goal: c.goal || 0,
            deadline: c.deadline ? c.deadline.split('T')[0] : '',
            image: c.image || '',
          });
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

  if (campaign.fundraiserId !== user._id && user.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">You don&apos;t have permission to edit this campaign</p>
      </div>
    );
  }

  const isEditable = ['draft', 'needs_information', 'rejected'].includes(campaign.status);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/campaigns/${campaign._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, goal: Number(formData.goal) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Campaign updated');
        router.push('/dashboard/fundraiser/campaigns');
      } else {
        toast.error(data.error?.message || 'Failed to update');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fundraiser/campaigns" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Campaigns
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Campaign</h1>
        <p className="mt-1 text-muted-foreground">
          Status: <Badge variant="outline">{campaign.status}</Badge>
          {!isEditable && (
            <span className="ml-2 text-sm text-yellow-600">(Only draft, rejected, or needs_information campaigns can be edited)</span>
          )}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} disabled={!isEditable} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => updateField('description', e.target.value)} disabled={!isEditable} maxLength={200} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={formData.category === cat.value ? 'default' : 'outline'}
                  className={`cursor-pointer ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => isEditable && updateField('category', cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Campaign Story</Label>
            <Textarea id="story" value={formData.story} onChange={(e) => updateField('story', e.target.value)} disabled={!isEditable} rows={8} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal (USD)</Label>
              <Input id="goal" type="number" min="1" value={formData.goal || ''} onChange={(e) => updateField('goal', Number(e.target.value))} disabled={!isEditable} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => updateField('deadline', e.target.value)} disabled={!isEditable} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={(e) => updateField('location', e.target.value)} disabled={!isEditable} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" value={formData.image} onChange={(e) => updateField('image', e.target.value)} disabled={!isEditable} />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 h-40 w-full rounded-lg object-cover" />
            )}
          </div>

          {isEditable && (
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
