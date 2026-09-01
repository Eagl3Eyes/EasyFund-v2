'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, DollarSign, Megaphone, Shield, MessageCircle, AlertTriangle } from 'lucide-react';
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
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
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
      if (notifData.success) setNotifications(notifData.data || []);
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
        className="relative h-9 w-9 text-white/60 hover:bg-white/[0.08] hover:text-white"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/[0.08] bg-[#071324]/95 p-0 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    for (const n of notifications.filter((n) => !n.read)) {
                      await markAsRead(n._id);
                    }
                  }}
                  className="text-xs text-[#0ef695] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-white/55">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  return (
                    <button
                      key={notification._id}
                      onClick={() => markAsRead(notification._id)}
                      className={`flex w-full items-start gap-3 border-b border-white/[0.08] px-4 py-3 text-left transition-colors hover:bg-white/[0.08] last:border-b-0 ${
                        !notification.read ? 'bg-[#0ef695]/5' : ''
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/55" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-xs text-white/55 line-clamp-2">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0ef695]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/[0.08] p-2">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg px-4 py-2 text-center text-sm text-[#0ef695] hover:bg-white/[0.08]"
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
