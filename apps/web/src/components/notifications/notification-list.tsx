'use client';

import { NotificationItem } from './notification-item';
import { Bell } from 'lucide-react';
import type { Notification } from '@/lib/types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium text-foreground">No notifications</p>
        <p className="mt-2 text-muted-foreground">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          <button onClick={onMarkAllRead} className="text-sm text-primary hover:underline">
            Mark all as read
          </button>
        </div>
      )}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
