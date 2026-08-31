'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiUrl } from '@/lib/config';
import type { Campaign } from '@/lib/types';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  location?: string;
  bio?: string;
  createdAt: string;
  verificationLevel?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, campaignsRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/users/${params.id}/profile`, { credentials: 'include' }),
          fetch(`${getApiUrl()}/api/campaigns?fundraiserId=${params.id}&status=published`, { credentials: 'include' }),
        ]);
        const profileData = await profileRes.json();
        const campaignsData = await campaignsRes.json();
        if (profileData.success) setProfile(profileData.data);
        if (campaignsData.success) setCampaigns(campaignsData.data?.campaigns || []);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {profile.image ? (
            <img src={profile.image} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            profile.name?.charAt(0) || 'U'
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
            {profile.verificationLevel && profile.verificationLevel !== 'none' && (
              <Badge variant="success" className="bg-[#0ef695]/15 text-[#0ef695]">
                <Shield className="mr-1 h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="capitalize">{profile.role}</span>
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Campaigns</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
