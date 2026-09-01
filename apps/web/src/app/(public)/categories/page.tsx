'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiUrl } from '@/lib/config';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  campaignCount: number;
  color: string;
}

const iconMap: Record<string, string> = {
  'book-open': '📚',
  'heart-pulse': '❤️',
  'users': '👥',
  'siren': '🆘',
  'leaf': '🌿',
  'palette': '🎨',
  'trophy': '🏆',
  'cpu': '💻',
  'paw-print': '🐾',
  'ellipsis': '📋',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${getApiUrl()}/api/categories`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch {
        // Use default categories
        setCategories([
          { _id: '1', name: 'Education', slug: 'education', icon: 'book-open', description: 'Support educational initiatives', campaignCount: 0, color: '#3B82F6' },
          { _id: '2', name: 'Health', slug: 'health', icon: 'heart-pulse', description: 'Healthcare and medical causes', campaignCount: 0, color: '#EF4444' },
          { _id: '3', name: 'Community', slug: 'community', icon: 'users', description: 'Community development projects', campaignCount: 0, color: '#10B981' },
          { _id: '4', name: 'Emergency', slug: 'emergency', icon: 'siren', description: 'Disaster relief and emergency aid', campaignCount: 0, color: '#F59E0B' },
          { _id: '5', name: 'Environment', slug: 'environment', icon: 'leaf', description: 'Environmental conservation', campaignCount: 0, color: '#22C55E' },
          { _id: '6', name: 'Arts & Culture', slug: 'arts-culture', icon: 'palette', description: 'Arts, culture, and heritage', campaignCount: 0, color: '#8B5CF6' },
          { _id: '7', name: 'Sports', slug: 'sports', icon: 'trophy', description: 'Sports and recreation', campaignCount: 0, color: '#06B6D4' },
          { _id: '8', name: 'Technology', slug: 'technology', icon: 'cpu', description: 'Technology and innovation', campaignCount: 0, color: '#6366F1' },
          { _id: '9', name: 'Animals', slug: 'animals', icon: 'paw-print', description: 'Animal welfare and rescue', campaignCount: 0, color: '#D97706' },
          { _id: '10', name: 'Other', slug: 'other', icon: 'ellipsis', description: 'Other causes', campaignCount: 0, color: '#6B7280' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Explore Categories</h1>
        <p className="mt-4 text-lg text-white/55">
          Find causes you care about and discover campaigns making a difference.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-8 shadow-sm">
              <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
              <Skeleton className="mt-4 h-6 w-32 bg-white/10" />
              <Skeleton className="mt-2 h-4 w-full bg-white/10" />
              <Skeleton className="mt-2 h-4 w-20 bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="group rounded-2xl border border-white/[0.08] bg-[#0c1828] p-8 shadow-sm transition-all hover:border-[#0ef695]/40 hover:shadow-[0_0_30px_rgba(14,246,149,0.06)]"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {iconMap[cat.icon] || '📋'}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white group-hover:text-[#0ef695] transition-colors">
                {cat.name}
              </h2>
              <p className="mt-2 text-sm text-white/55">{cat.description}</p>
              <p className="mt-3 text-xs text-white/40">
                {cat.campaignCount} campaign{cat.campaignCount !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
