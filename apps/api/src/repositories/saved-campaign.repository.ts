import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { savedCampaigns } from '../config/database';

export interface SavedCampaignDocument {
  _id?: any;
  userId: string;
  campaignId: string;
  createdAt: string;
}

export class SavedCampaignRepository extends BaseRepository<SavedCampaignDocument> {
  constructor() {
    super(savedCampaigns);
  }

  async findByUser(
    userId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<SavedCampaignDocument>> {
    return this.findPaginated(
      { userId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findByUserAndCampaign(userId: string, campaignId: string): Promise<SavedCampaignDocument | null> {
    return this.findOne({ userId, campaignId } as any);
  }

  async isSaved(userId: string, campaignId: string): Promise<boolean> {
    return this.exists({ userId, campaignId } as any);
  }

  async toggle(userId: string, campaignId: string): Promise<{ saved: boolean }> {
    const existing = await this.findByUserAndCampaign(userId, campaignId);

    if (existing) {
      await this.deleteOne({ userId, campaignId } as any);
      return { saved: false };
    } else {
      await this.create({ userId, campaignId, createdAt: new Date().toISOString() });
      return { saved: true };
    }
  }
}
