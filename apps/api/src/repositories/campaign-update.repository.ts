import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { campaignUpdates } from '../config/database';

export interface CampaignUpdateDocument {
  _id?: any;
  campaignId: string;
  fundraiserId: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

export class CampaignUpdateRepository extends BaseRepository<CampaignUpdateDocument> {
  constructor() {
    super(campaignUpdates);
  }

  async findByCampaign(
    campaignId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<CampaignUpdateDocument>> {
    return this.findPaginated(
      { campaignId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findByFundraiser(
    fundraiserId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<CampaignUpdateDocument>> {
    return this.findPaginated(
      { fundraiserId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }
}
