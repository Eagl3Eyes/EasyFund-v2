'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Menu, X, Bell, LogOut, LayoutDashboard, Settings, User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/lib/config';

const navLinks = [
  { label: 'Explore', href: '/explore' },
  { label: 'Categories', href: '/categories' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About Us', href: '/about' },
  { label: 'Success Stories', href: '/explore' },
];

export function LandingNavbar() {
  const [menu, setMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const isAuthenticated = !loading && user !== null;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${getApiUrl()}/api/auth/notifications/unread-count`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => { if (data.success) setUnreadCount(data.data?.count || 0); })
      .catch(() => {});
  }, [isAuthenticated]);

  async function handleLogout() {
    await logout();
    router.push('/');
    setMenu(false);
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <nav className="flex h-14 items-center justify-between rounded-2xl border border-white/[0.08] bg-[#071324]/80 px-4 shadow-2xl backdrop-blur-xl sm:h-16 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0ef695] text-[#060e1e] shadow-lg shadow-[#0ef695]/20 sm:h-9 sm:w-9">
              <Heart className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
            </div>
            <span className="text-base font-bold tracking-tight sm:text-lg">
              Easy<span className="text-[#0ef695]">Fund</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-6 text-[13px] font-medium text-white/60 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link
                  href="/dashboard/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-xl transition hover:ring-2 hover:ring-white/20" aria-label="User account menu">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                        <AvatarFallback className="bg-[#0ef695] text-[#060e1e] text-sm font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#071324]/95 backdrop-blur-xl">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                        <AvatarFallback className="bg-[#0ef695] text-[#060e1e] text-xs font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user?.name}</span>
                        <span className="text-xs text-white/50">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="text-white/60 focus:bg-white/10 focus:text-white">
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-white/60 focus:bg-white/10 focus:text-white">
                      <Link href="/dashboard/fundraiser/campaigns">
                        <User className="mr-2 h-4 w-4" />
                        My Campaigns
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-white/60 focus:bg-white/10 focus:text-white">
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleLogout} className="text-white/60 focus:bg-white/10 focus:text-white cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Start Campaign (always show for authenticated users) */}
                <Link
                  href="/dashboard/fundraiser/campaigns/new"
                  className="rounded-xl bg-[#0ef695] px-5 py-2 text-[13px] font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:-translate-y-0.5 hover:bg-[#38f9a8]"
                >
                  Start a Campaign
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-white/12 px-4 py-[7px] text-[13px] font-medium transition hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/dashboard/fundraiser/campaigns/new"
                  className="rounded-xl bg-[#0ef695] px-5 py-2 text-[13px] font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:-translate-y-0.5 hover:bg-[#38f9a8]"
                >
                  Start a Campaign
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenu(!menu)}
            className="rounded-xl border border-white/10 p-2 lg:hidden"
            aria-label="Menu"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menu && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-[#071324]/95 p-4 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenu(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                      <AvatarFallback className="bg-[#0ef695] text-[#060e1e] text-xs font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{user?.name}</span>
                      <span className="text-xs text-white/50">{user?.email}</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenu(false)}
                    className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/fundraiser/campaigns"
                    onClick={() => setMenu(false)}
                    className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    My Campaigns
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-2.5 text-sm text-left text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenu(false)}
                    className="rounded-xl border border-white/10 py-2.5 text-center text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/dashboard/fundraiser/campaigns/new"
                    onClick={() => setMenu(false)}
                    className="rounded-xl bg-[#0ef695] py-2.5 text-center text-sm font-bold text-[#060e1e]"
                  >
                    Start Campaign
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
