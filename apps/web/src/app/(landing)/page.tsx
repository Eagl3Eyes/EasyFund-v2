import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(
  () => import('@/components/landing/landing-page'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'EasyFund — Make a Difference. Fund What Matters.',
  description:
    'EasyFund connects people with meaningful causes. Start a campaign or support someone’s cause today.',
  openGraph: {
    title: 'EasyFund — Make a Difference. Fund What Matters.',
    description:
      'EasyFund connects people with meaningful causes. Start a campaign or support someone’s cause today.',
    url: 'https://easyfund.com',
    siteName: 'EasyFund',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyFund — Make a Difference. Fund What Matters.',
    description:
      'EasyFund connects people with meaningful causes. Start a campaign or support someone’s cause today.',
  },
};

export default function Page() {
  return <LandingPage />;
}
