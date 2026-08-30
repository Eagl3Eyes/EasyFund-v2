import type { Metadata } from 'next';
import { CampaignDetailClient } from '@/components/campaign/campaign-detail-client';
import { getApiUrl } from '@/lib/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCampaign(slug: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/campaigns/${slug}`, {
      credentials: 'include',
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const campaign = await getCampaign(params.slug);

  if (!campaign) {
    return { title: 'Campaign Not Found | EasyFund' };
  }

  const title = `${campaign.title} | EasyFund`;
  const description = campaign.description?.substring(0, 160) || `Support "${campaign.title}" on EasyFund`;
  const imageUrl = campaign.image || `${BASE_URL}/og-default.png`;

  return {
    title,
    description,
    openGraph: {
      title: campaign.title,
      description,
      url: `${BASE_URL}/campaign/${campaign.slug}`,
      siteName: 'EasyFund',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: campaign.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description,
      images: [imageUrl],
    },
  };
}

export default function CampaignDetailPage({ params }: { params: { slug: string } }) {
  return <CampaignDetailClient slug={params.slug} />;
}
