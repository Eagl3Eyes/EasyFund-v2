'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Bell, ChevronDown, Heart, LogOut, LayoutDashboard, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/config';

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/categories', label: 'Categories' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/how-it-works', label: 'How It Works' },
];

const mobileNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/categories', label: 'Categories' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

interface NavbarProps {
  variant?: 'light' | 'dark';
}

export function Navbar({ variant = 'light' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading, logout } = useAuth();

  const isAuthenticated = !loading && user !== null;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${getApiUrl()}/api/auth/notifications/unread-count`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => { if (data.success) setUnreadCount(data.data?.count || 0); })
      .catch(() => {});
  }, [isAuthenticated, pathname]);

  async function handleLogout() {
    await logout();
    router.push('/');
    setMobileOpen(false);
  }

  const isDark = variant === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]',
        isDark
          ? 'border-white/10 bg-[#0a0f1a]/80'
          : 'border-border bg-background/95 supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Easy</span>
            <span className={isDark ? 'text-white' : 'text-foreground'}>Fund</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'text-primary'
                    : isDark ? 'text-gray-300' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className={cn('hidden md:flex', isDark && 'text-gray-300 hover:text-white')} asChild aria-label="Search">
            <Link href="/explore">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <ThemeToggle aria-label="Toggle theme" />

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className={cn('hidden md:flex relative', isDark && 'text-gray-300 hover:text-white')} asChild aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
                <Link href="/dashboard/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/saved">
                      <Heart className="mr-2 h-4 w-4" />
                      Saved Campaigns
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/donations">My Donations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild className={isDark ? 'text-gray-300 hover:text-white' : ''}>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild className={isDark ? 'bg-[#10B981] hover:bg-[#059669] text-white' : ''}>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          <Button asChild className={cn('hidden md:flex', isDark ? 'bg-white text-[#0a0f1a] hover:bg-white/90' : '')}>
            <Link href="/dashboard/fundraiser/campaigns/new">Start a Campaign</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className={cn('w-80', isDark ? 'bg-[#0a0f1a]' : '')}>
              <div className="flex flex-col gap-4 mt-8">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary py-2',
                      pathname === link.href ? 'text-primary' : isDark ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-4" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={cn('text-lg font-medium py-2', isDark ? 'text-white' : '')}
                    >
                      Dashboard
                    </Link>
                    <Button variant="destructive" className="mt-4" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className={cn('w-full', isDark ? 'border-white/20 text-white hover:bg-white/10' : '')}>
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button asChild className={cn('w-full', isDark ? 'bg-[#10B981] hover:bg-[#059669] text-white' : '')}>
                      <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
                <Button asChild className={cn('w-full mt-2', isDark ? 'bg-white text-[#0a0f1a] hover:bg-white/90' : '')}>
                  <Link href="/dashboard/fundraiser/campaigns/new" onClick={() => setMobileOpen(false)}>
                    Start a Campaign
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
