'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Shield, Users, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getApiUrl } from '@/lib/config';

interface Organization {
  _id: string;
  name: string;
  description: string;
  image?: string;
  website?: string;
  verified: boolean;
  campaignCount: number;
  totalRaised: number;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch(`${getApiUrl()}/api/organizations?limit=50`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setOrganizations(data.data || []);
      } catch {} finally { setLoading(false); }
    }
    fetchOrgs();
  }, []);

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Organizations</h1>
        <p className="mt-2 text-lg text-white/55">
          Trusted organizations running campaigns on EasyFund
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-white/[0.08] bg-[#0c1828] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-white/30" />
          <p className="mt-4 text-lg font-medium text-white">
            {search ? 'No organizations match your search' : 'No organizations yet'}
          </p>
          <p className="mt-2 text-white/55">
            {search ? 'Try a different search term' : 'Organizations will appear here once registered'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <Card key={org._id} className="overflow-hidden border-white/[0.08] bg-[#0c1828]">
              {org.image && (
                <div className="aspect-[16/6] overflow-hidden">
                  <img src={org.image} alt={org.name} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                  {org.verified && (
                    <Badge variant="success" className="bg-[#0ef695]/15 text-[#0ef695] border-transparent">
                      <Shield className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>
                {org.description && (
                  <p className="mt-2 text-sm text-white/55 line-clamp-2">{org.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-white/40">
                  <span>{org.campaignCount} campaigns</span>
                  <span className="font-medium text-[#0ef695]">${org.totalRaised.toLocaleString()} raised</span>
                </div>
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-[#0ef695] hover:underline">
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
