'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

export function SmartNavbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return <Navbar variant={isHome ? 'dark' : 'light'} />;
}
