'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/config';

export function useDonationsByCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['donations', 'campaign', campaignId],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/donations/campaign/${campaignId}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch donations');
      return data.data;
    },
    enabled: !!campaignId,
  });
}

export function useDonationsByUser(email: string) {
  return useQuery({
    queryKey: ['donations', 'user', email],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/donations/user/${encodeURIComponent(email)}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch donations');
      return data.data;
    },
    enabled: !!email,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      campaignId: string;
      amount: number;
      message?: string;
      anonymous?: boolean;
      donorEmail: string;
      donorName?: string;
    }) => {
      const res = await fetch(`${getApiUrl()}/api/donations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create donation');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useRecentDonations(limit = 5) {
  return useQuery({
    queryKey: ['donations', 'recent', limit],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/donations/recent?limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch');
      return data.data;
    },
  });
}
