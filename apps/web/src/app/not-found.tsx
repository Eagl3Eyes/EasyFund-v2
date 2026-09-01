import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-white/10 p-6">
        <span className="text-6xl">🔍</span>
      </div>
      <h1 className="mt-6 text-4xl font-bold text-white">Page Not Found</h1>
      <p className="mt-4 max-w-md text-white/55">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/explore">
          <Button variant="outline">Explore Campaigns</Button>
        </Link>
      </div>
    </div>
  );
}
