'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/config';

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/auth/notifications?limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch');
      return data.data;
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/auth/notifications/unread-count`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to fetch');
      return data.data?.count || 0;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`${getApiUrl()}/api/auth/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/auth/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
