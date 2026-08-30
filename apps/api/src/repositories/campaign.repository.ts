import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { campaigns } from '../config/database';

export interface CampaignDocument {
  _id?: any;
  slug: string;
  title: string;
  description: string;
  story: string;
  image: string;
  gallery: string[];
  category: string;
  location: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'active' | 'needs_information' | 'rejected' | 'suspended' | 'cancelled' | 'completed';
  goal: number;
  amountRaised: number;
  supportersCount: number;
  deadline: string;
  fundraiserId: string;
  fundraiserName: string;
  fundraiserImage: string;
  fundraiserVerified: boolean;
  beneficiaryType: 'self' | 'someone_else' | 'organization' | 'community';
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  milestones: Array<{
    title: string;
    amount: number;
    description: string;
    reached: boolean;
  }>;
  updatesCount: number;
  commentsCount: number;
  riskScore: number;
  reportCount: number;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilters {
  status?: string;
  category?: string;
  search?: string;
  minGoal?: number;
  maxGoal?: number;
  minRaised?: number;
  featured?: boolean;
  trending?: boolean;
  fundraiserId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CampaignRepository extends BaseRepository<CampaignDocument> {
  constructor() {
    super(campaigns);
  }

  async findBySlug(slug: string): Promise<CampaignDocument | null> {
    return this.findOne({ slug } as any);
  }

  async findByFundraiser(
    fundraiserId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<CampaignDocument>> {
    return this.findPaginated({ fundraiserId } as any, options);
  }

  async findFeatured(limit = 6): Promise<CampaignDocument[]> {
    return this.find(
      { featured: true, status: 'active' } as any,
      { sort: { createdAt: -1 }, limit }
    );
  }

  async findTrending(limit = 6): Promise<CampaignDocument[]> {
    return this.find(
      { status: 'active' } as any,
      { sort: { supportersCount: -1, amountRaised: -1 }, limit }
    );
  }

  async findEndingSoon(limit = 6): Promise<CampaignDocument[]> {
    const now = new Date().toISOString();
    return this.find(
      { status: 'active', deadline: { $gt: now } } as any,
      { sort: { deadline: 1 }, limit }
    );
  }

  async findAlmostFunded(limit = 6): Promise<CampaignDocument[]> {
    return this.find(
      { status: 'active' } as any,
      { sort: { amountRaised: -1 }, limit }
    );
  }

  async search(query: string, options?: QueryOptions): Promise<PaginatedResult<CampaignDocument>> {
    return this.findPaginated(
      { $text: { $search: query }, status: 'active' } as any,
      options
    );
  }

  async findByFilters(
    filters: CampaignFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<CampaignDocument>> {
    const filter: any = { status: 'active' };

    if (filters.category) filter.category = filters.category;
    if (filters.search) filter.$text = { $search: filters.search };
    if (filters.minGoal || filters.maxGoal) {
      filter.goal = {};
      if (filters.minGoal) filter.goal.$gte = filters.minGoal;
      if (filters.maxGoal) filter.goal.$lte = filters.maxGoal;
    }
    if (filters.fundraiserId) filter.fundraiserId = filters.fundraiserId;

    const sort: Record<string, 1 | -1> = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return this.findPaginated(filter, { ...options, sort });
  }

  async incrementAmountRaised(campaignId: string, amount: number): Promise<void> {
    await this.collection.updateOne(
      { _id: campaignId } as any,
      {
        $inc: { amountRaised: amount, supportersCount: 1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async decrementAmountRaised(campaignId: string, amount: number): Promise<void> {
    await this.collection.updateOne(
      { _id: campaignId } as any,
      {
        $inc: { amountRaised: -amount, supportersCount: -1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async incrementUpdateCount(campaignId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: campaignId } as any,
      {
        $inc: { updatesCount: 1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async incrementCommentCount(campaignId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: campaignId } as any,
      {
        $inc: { commentsCount: 1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async updateStatus(
    campaignId: string,
    status: CampaignDocument['status']
  ): Promise<CampaignDocument | null> {
    return this.updateById(campaignId, {
      $set: { status, updatedAt: new Date().toISOString() },
    } as any);
  }

  async toggleFeatured(campaignId: string, featured: boolean): Promise<CampaignDocument | null> {
    return this.updateById(campaignId, {
      $set: { featured, updatedAt: new Date().toISOString() },
    } as any);
  }

  async toggleTrending(campaignId: string, trending: boolean): Promise<CampaignDocument | null> {
    return this.updateById(campaignId, {
      $set: { trending, updatedAt: new Date().toISOString() },
    } as any);
  }

  async getStats() {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRaised: { $sum: '$amountRaised' },
          totalGoal: { $sum: '$goal' },
        },
      },
    ];
    return this.aggregate<{ _id: string; count: number; totalRaised: number; totalGoal: number }>(pipeline);
  }

  async getMonthlyStats(year: number) {
    const pipeline = [
      { $addFields: { createdDate: { $toDate: '$createdAt' } } },
      {
        $match: {
          createdDate: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdDate' },
          count: { $sum: 1 },
          totalRaised: { $sum: '$amountRaised' },
        },
      },
      { $sort: { _id: 1 } },
    ];
    return this.aggregate<{ _id: number; count: number; totalRaised: number }>(pipeline);
  }
}
