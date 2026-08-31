'use client';

import { Bell, Check, Megaphone, DollarSign, Shield, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/lib/types';

const typeIcons: Record<string, React.ReactNode> = {
  donation: <DollarSign className="h-4 w-4 text-green-500" />,
  campaign_status: <Megaphone className="h-4 w-4 text-blue-500" />,
  verification: <Shield className="h-4 w-4 text-purple-500" />,
  withdrawal: <DollarSign className="h-4 w-4 text-orange-500" />,
  comment: <Bell className="h-4 w-4 text-gray-500" />,
  report: <AlertTriangle className="h-4 w-4 text-red-500" />,
  milestone: <Check className="h-4 w-4 text-primary" />,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        !notification.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
      }`}
      onClick={() => !notification.read && onMarkRead?.(notification._id)}
    >
      <div className="mt-0.5 shrink-0">
        {typeIcons[notification.type] || <Bell className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{notification.title}</p>
          {!notification.read && <Badge className="h-1.5 w-1.5 rounded-full bg-primary p-0" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
