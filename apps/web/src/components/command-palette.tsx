'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Home, Compass, Megaphone, Settings, User, LogOut, Bell, Heart } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border bg-card shadow-lg transition-shadow hover:shadow-xl lg:hidden"
        aria-label="Open command palette"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
            <Command className="rounded-xl border bg-card shadow-2xl">
              <div className="flex items-center border-b px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex h-12 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigation">
                  <Command.Item
                    onSelect={() => navigate('/')}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Home className="h-4 w-4" /> Home
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate('/explore')}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Compass className="h-4 w-4" /> Explore Campaigns
                  </Command.Item>
                  {user && (
                    <Command.Item
                      onSelect={() => navigate('/dashboard')}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <User className="h-4 w-4" /> Dashboard
                    </Command.Item>
                  )}
                </Command.Group>

                {user && (
                  <Command.Group heading="Quick Actions">
                    {(user.role === 'fundraiser' || user.role === 'admin') && (
                      <Command.Item
                        onSelect={() => navigate('/dashboard/fundraiser/campaigns/new')}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Megaphone className="h-4 w-4" /> Start a Campaign
                      </Command.Item>
                    )}
                    <Command.Item
                      onSelect={() => navigate('/dashboard/donations')}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Heart className="h-4 w-4" /> My Donations
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigate('/dashboard/notifications')}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigate('/dashboard/settings')}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Command.Item>
                    <Command.Item
                      onSelect={() => { setOpen(false); logout(); }}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
