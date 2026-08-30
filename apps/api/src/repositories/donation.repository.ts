import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { donations } from '../config/database';

export interface DonationDocument {
  _id?: any;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  fundraiserName: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  anonymous: boolean;
  message: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface DonationFilters {
  campaignId?: string;
  userId?: string;
  userEmail?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DonationRepository extends BaseRepository<DonationDocument> {
  constructor() {
    super(donations);
  }

  async findByCampaign(
    campaignId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<DonationDocument>> {
    return this.findPaginated(
      { campaignId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findByUser(userId: string, options?: QueryOptions): Promise<PaginatedResult<DonationDocument>> {
    return this.findPaginated({ userId } as any, { ...options, sort: { createdAt: -1 } });
  }

  async findByUserEmail(userEmail: string, options?: QueryOptions): Promise<PaginatedResult<DonationDocument>> {
    return this.findPaginated({ userEmail } as any, { ...options, sort: { createdAt: -1 } });
  }

  async findByTransactionId(transactionId: string): Promise<DonationDocument | null> {
    return this.findOne({ transactionId } as any);
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<DonationDocument | null> {
    return this.findOne({ stripePaymentIntentId } as any);
  }

  async findByFilters(
    filters: DonationFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<DonationDocument>> {
    const filter: any = {};
    if (filters.campaignId) filter.campaignId = filters.campaignId;
    if (filters.userId) filter.userId = filters.userId;
    if (filters.userEmail) filter.userEmail = filters.userEmail;
    if (filters.status) filter.status = filters.status;
    if (filters.minAmount || filters.maxAmount) {
      filter.amount = {};
      if (filters.minAmount) filter.amount.$gte = filters.minAmount;
      if (filters.maxAmount) filter.amount.$lte = filters.maxAmount;
    }
    if (filters.startDate || filters.endDate) {
      filter.createdAt = {};
      if (filters.startDate) filter.createdAt.$gte = filters.startDate;
      if (filters.endDate) filter.createdAt.$lte = filters.endDate;
    }

    const sort: Record<string, 1 | -1> = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return this.findPaginated(filter, { ...options, sort });
  }

  async getTotalRaisedByCampaign(campaignId: string): Promise<number> {
    const pipeline = [
      { $match: { campaignId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ];
    const result = await this.aggregate<{ _id: null; total: number }>(pipeline);
    return result[0]?.total || 0;
  }

  async getSupportersCountByCampaign(campaignId: string): Promise<number> {
    return this.count({ campaignId, status: 'completed' } as any);
  }

  async getRecentDonations(limit = 5): Promise<DonationDocument[]> {
    return this.find(
      { status: 'completed' } as any,
      { sort: { createdAt: -1 }, limit }
    );
  }

  async getMonthlyStats(year: number) {
    const pipeline = [
      { $addFields: { createdDate: { $toDate: '$createdAt' } } },
      {
        $match: {
          status: 'completed',
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
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ];
    return this.aggregate<{ _id: number; count: number; totalAmount: number }>(pipeline);
  }

  async getTopDonors(limit = 10) {
    const pipeline = [
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          totalAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
    ];
    return this.aggregate<{
      _id: string; userName: string; userEmail: string; totalAmount: number; donationCount: number;
    }>(pipeline);
  }

  async updateStatus(donationId: string, status: DonationDocument['status']): Promise<DonationDocument | null> {
    return this.updateById(donationId, { $set: { status } } as any);
  }

  async getStats() {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ];
    return this.aggregate<{ _id: string; count: number; totalAmount: number }>(pipeline);
  }
}
