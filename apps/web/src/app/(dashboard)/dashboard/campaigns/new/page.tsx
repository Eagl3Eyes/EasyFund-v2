import type { Metadata } from 'next';
import { CampaignWizard } from '@/components/campaign/campaign-wizard';

export const metadata: Metadata = {
  title: 'Create Campaign - EasyFund',
  description: 'Start a new fundraising campaign on EasyFund.',
};

export default function CreateCampaignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create a Campaign</h1>
        <p className="mt-2 text-muted-foreground">
          Tell your story and start raising funds for your cause
        </p>
      </div>
      <CampaignWizard />
    </div>
  );
}
