'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/config';

export function useCampaigns(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
      }
      const res = await fetch(`${getApiUrl()}/api/campaigns?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch campaigns');
      return data.data;
    },
  });
}

export function useCampaign(slug: string) {
  return useQuery({
    queryKey: ['campaign', slug],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/campaigns/${slug}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Campaign not found');
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedCampaigns(limit = 6) {
  return useQuery({
    queryKey: ['campaigns', 'featured', limit],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/campaigns/featured?limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch');
      return data.data;
    },
  });
}

export function useTrendingCampaigns(limit = 6) {
  return useQuery({
    queryKey: ['campaigns', 'trending', limit],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/campaigns/trending?limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch');
      return data.data;
    },
  });
}

export function useSaveCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(`${getApiUrl()}/api/campaigns/${campaignId}/save`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to save');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
