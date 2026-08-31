'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Megaphone,
  DollarSign,
  Settings,
  Bell,
  ChevronLeft,
  Menu,
  LogOut,
  Bookmark,
  Shield,
  ArrowDownToLine,
  BarChart3,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

const donorLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/donations', label: 'My Donations', icon: Heart },
  { href: '/dashboard/saved', label: 'Saved Campaigns', icon: Bookmark },
  { href: '/dashboard/following', label: 'Following', icon: Users },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const fundraiserLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/campaigns', label: 'My Campaigns', icon: Megaphone },
  { href: '/dashboard/campaigns/new', label: 'Create Campaign', icon: Megaphone },
  { href: '/dashboard/fundraiser/donations', label: 'Donations Received', icon: Heart },
  { href: '/dashboard/fundraiser/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: DollarSign },
  { href: '/dashboard/withdrawals/request', label: 'Request Withdrawal', icon: ArrowDownToLine },
  { href: '/dashboard/updates', label: 'Post Update', icon: Bell },
  { href: '/dashboard/verification', label: 'Verification', icon: Shield },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { href: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: LayoutDashboard },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/verification', label: 'Verification', icon: LayoutDashboard },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports', icon: LayoutDashboard },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links =
    user?.role === 'admin'
      ? [...donorLinks.slice(0, 1), ...adminLinks, ...donorLinks.slice(1)]
      : user?.role === 'fundraiser'
      ? fundraiserLinks
      : donorLinks;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          EasyFund
        </Link>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start text-muted-foreground"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const mobileLinks =
    user?.role === 'admin'
      ? adminLinks.slice(0, 4)
      : user?.role === 'fundraiser'
      ? fundraiserLinks.slice(0, 4)
      : donorLinks.slice(0, 4);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-20 left-4 z-40">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden" role="navigation" aria-label="Dashboard navigation">
        <div className="flex items-center justify-around py-2">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
