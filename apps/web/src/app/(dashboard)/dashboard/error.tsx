'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-white/55">{error.message || 'Failed to load dashboard'}</p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">Try Again</Button>
        <Button asChild><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  );
}
