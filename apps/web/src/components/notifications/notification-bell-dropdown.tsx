'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, DollarSign, Megaphone, Shield, MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/config';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  donation: DollarSign,
  campaign_status: Megaphone,
  verification: Shield,
  withdrawal: DollarSign,
  comment: MessageCircle,
  report: AlertTriangle,
};

export function NotificationBellDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/notifications/unread-count`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.data?.count || 0);

      const notifRes = await fetch(`${getApiUrl()}/api/auth/notifications?limit=5`, {
        credentials: 'include',
      });
      const notifData = await notifRes.json();
      if (notifData.success) setNotifications(notifData.data?.notifications || []);
    } catch {}
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`${getApiUrl()}/api/auth/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover p-0 shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    for (const n of notifications.filter((n) => !n.read)) {
                      await markAsRead(n._id);
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  return (
                    <button
                      key={notification._id}
                      onClick={() => markAsRead(notification._id)}
                      className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t p-2">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md px-4 py-2 text-center text-sm text-primary hover:bg-muted/50"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
