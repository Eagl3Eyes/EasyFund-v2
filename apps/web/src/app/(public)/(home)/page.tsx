import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const HomeExperience = dynamic(
  () => import('@/components/home-3d/HomeExperience').then((mod) => ({ default: mod.HomeExperience })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-32 animate-pulse rounded bg-white/10" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'EasyFund — Make a Difference. Fund What Matters.',
  description:
    'Support real people, meaningful causes, and communities that need your help. Every contribution creates lasting impact. Browse campaigns and start fundraising on EasyFund.',
  openGraph: {
    title: 'EasyFund — Make a Difference. Fund What Matters.',
    description:
      'Support real people, meaningful causes, and communities that need your help.',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeExperience />;
}
