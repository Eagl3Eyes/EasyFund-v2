'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-white">Explore Campaigns</h1>
        <p className="mt-2 text-white/55">
          Discover causes that matter to you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search campaigns..."
                aria-label="Search campaigns"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 border-white/[0.08] bg-card text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50"
              />
            </div>
            <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-5 py-2.5 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8]">
              Search
            </button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-2xl border border-white/[0.08] bg-card p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-white">Category</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={category === cat.value ? 'default' : 'outline'}
                      className={`cursor-pointer rounded-full transition-colors ${category === cat.value ? 'bg-[#0ef695] text-[#060e1e] border-transparent' : 'border-white/[0.12] text-white/60 hover:border-white/25 hover:text-white'}`}
                      onClick={() => { setCategory(cat.value); setPage(1); }}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-white">Sort By</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sortOptions.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={sort === opt.value ? 'default' : 'outline'}
                      className={`cursor-pointer rounded-full transition-colors ${sort === opt.value ? 'bg-[#0ef695] text-[#060e1e] border-transparent' : 'border-white/[0.12] text-white/60 hover:border-white/25 hover:text-white'}`}
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
            <span className="text-sm text-white/55">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/70">
                Search: {search}
                <button onClick={() => { setSearch(''); setPage(1); }} className="ml-1 hover:text-white transition-colors" aria-label="Clear search filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/70">
                Category: {categories.find(c => c.value === category)?.label}
                <button onClick={() => { setCategory(''); setPage(1); }} className="ml-1 hover:text-white transition-colors" aria-label="Clear category filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sort !== 'newest' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/70">
                Sort: {sortOptions.find(o => o.value === sort)?.label}
                <button onClick={() => { setSort('newest'); setPage(1); }} className="ml-1 hover:text-white transition-colors" aria-label="Clear sort filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white backdrop-blur transition hover:bg-white/10">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-white/55">
        {loading ? 'Loading...' : `${total} campaign${total !== 1 ? 's' : ''} found`}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-card shadow-sm overflow-hidden">
              <Skeleton className="h-48 w-full bg-white/5" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-3 w-full bg-white/10" />
                <Skeleton className="h-2 w-full bg-white/10" />
                <Skeleton className="h-3 w-1/2 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-card p-12 text-center">
          <p className="text-lg font-medium text-white">No campaigns found</p>
          <p className="mt-2 text-white/55">
            Try adjusting your search or filters
          </p>
          <button onClick={clearFilters} className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
            Clear filters
          </button>
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
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm text-white/55">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
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
