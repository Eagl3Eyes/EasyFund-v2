'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Explore', anchor: '#discover', route: '/explore' },
  { label: 'Categories', anchor: '#support', route: '/categories' },
  { label: 'How It Works', anchor: '#impact', route: '/how-it-works' },
  { label: 'About Us', anchor: '#trust', route: '/about' },
  { label: 'Success Stories', anchor: '#joinus', route: '/explore' },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const isHome = pathname === '/';

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
            {navLinks.map((link) =>
              isHome ? (
                <a key={link.label} href={link.anchor} className="transition hover:text-white">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.route} className="transition hover:text-white">
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
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
              {navLinks.map((link) =>
                isHome ? (
                  <a
                    key={link.label}
                    href={link.anchor}
                    onClick={() => setMenu(false)}
                    className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.route}
                    onClick={() => setMenu(false)}
                    className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
