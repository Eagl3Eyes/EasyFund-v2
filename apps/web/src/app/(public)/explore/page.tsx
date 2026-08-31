'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

const categories = [
  { value: '', label: 'All' },
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

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'ending', label: 'Ending Soon' },
  { value: 'funded', label: 'Most Funded' },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${getApiUrl()}/api/users/saved/campaigns?limit=100`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setSavedIds(new Set((d.data || []).map((c: Campaign) => c._id))); })
      .catch(() => {});
  }, []);

  const handleSave = async (id: string) => {
    const isSaved = savedIds.has(id);
    setSavedIds(prev => { const next = new Set(prev); isSaved ? next.delete(id) : next.add(id); return next; });
    try {
      await fetch(`${getApiUrl()}/api/users/saved/campaigns`, {
        method: isSaved ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id }),
      });
    } catch { setSavedIds(prev => { const next = new Set(prev); isSaved ? next.add(id) : next.delete(id); return next; }); }
  };

  const handleFollow = async (id: string) => {
    const isFollowing = followingIds.has(id);
    setFollowingIds(prev => { const next = new Set(prev); isFollowing ? next.delete(id) : next.add(id); return next; });
    try {
      await fetch(`${getApiUrl()}/api/follows/campaign/${id}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        credentials: 'include',
      });
    } catch { setFollowingIds(prev => { const next = new Set(prev); isFollowing ? next.add(id) : next.delete(id); return next; }); }
  };

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        params.set('page', String(page));
        params.set('limit', '12');

        // Map sort to API params
        switch (sort) {
          case 'popular':
            params.set('sortBy', 'supportersCount');
            params.set('sortOrder', 'desc');
            break;
          case 'ending':
            params.set('sortBy', 'deadline');
            params.set('sortOrder', 'asc');
            break;
          case 'funded':
            params.set('sortBy', 'amountRaised');
            params.set('sortOrder', 'desc');
            break;
          default: // newest
            params.set('sortBy', 'createdAt');
            params.set('sortOrder', 'desc');
        }

        const res = await fetch(`${getApiUrl()}/api/campaigns?${params.toString()}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.data);
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [search, category, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = search || category || sort !== 'newest';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Explore Campaigns</h1>
        <p className="mt-2 text-muted-foreground">
          Discover causes that matter to you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                aria-label="Search campaigns"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border bg-card p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={category === cat.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => { setCategory(cat.value); setPage(1); }}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Sort By</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sortOptions.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={sort === opt.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => { setSort(opt.value); setPage(1); }}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search && (
              <Badge variant="secondary">
                Search: {search}
                <button onClick={() => { setSearch(''); setPage(1); }} className="ml-1" aria-label="Clear search filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary">
                Category: {categories.find(c => c.value === category)?.label}
                <button onClick={() => { setCategory(''); setPage(1); }} className="ml-1" aria-label="Clear category filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sort !== 'newest' && (
              <Badge variant="secondary">
                Sort: {sortOptions.find(o => o.value === sort)?.label}
                <button onClick={() => { setSort('newest'); setPage(1); }} className="ml-1" aria-label="Clear sort filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-muted-foreground">
        {loading ? 'Loading...' : `${total} campaign${total !== 1 ? 's' : ''} found`}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-lg font-medium text-foreground">No campaigns found</p>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id || campaign.slug}
              campaign={campaign}
              saved={savedIds.has(campaign._id)}
              onSave={handleSave}
              following={followingIds.has(campaign._id)}
              onFollow={handleFollow}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
