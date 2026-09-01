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
  User,
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
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const fundraiserLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/fundraiser/campaigns', label: 'My Campaigns', icon: Megaphone },
  { href: '/dashboard/fundraiser/campaigns/new', label: 'Create Campaign', icon: Megaphone },
  { href: '/dashboard/fundraiser/donations', label: 'Donations Received', icon: Heart },
  { href: '/dashboard/fundraiser/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/fundraiser/withdrawals', label: 'Withdrawals', icon: DollarSign },
  { href: '/dashboard/fundraiser/withdrawals/request', label: 'Request Withdrawal', icon: ArrowDownToLine },
  { href: '/dashboard/fundraiser/updates', label: 'Post Update', icon: Bell },
  { href: '/dashboard/fundraiser/verification', label: 'Verification', icon: Shield },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { href: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/verification', label: 'Verification', icon: Shield },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
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
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0ef695] text-[#060e1e] shadow-lg shadow-[#0ef695]/20">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Easy<span className="text-[#0ef695]">Fund</span>
          </span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close sidebar">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="bg-white/[0.08]" />

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-l-2 border-[#0ef695] bg-[#0ef695]/10 pl-2.5 text-[#0ef695] shadow-[inset_3px_0_12px_rgba(14,246,149,0.08)]'
                  : 'text-white/60 hover:bg-white/[0.08] hover:pl-3.5 hover:text-white'
              )}
            >
              <link.icon
                className={cn(
                  'h-4 w-4 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-[#0ef695]' : 'text-white/40'
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-2 ring-[#0ef695]/20">
            {user?.image ? (
              <img src={user.image} alt={user.name || ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0ef695] text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start border-r border-white/[0.08] bg-[#071324]/80 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-20 left-4 z-40">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#071324]/80 backdrop-blur-xl text-white/60 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-white/[0.08] bg-[#071324]/95 p-0 backdrop-blur-xl">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#071324]/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] lg:hidden"
        role="navigation"
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center justify-around py-2">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition-all duration-200 ${
                  isActive ? 'text-[#0ef695]' : 'text-white/50 hover:text-white/70'
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
