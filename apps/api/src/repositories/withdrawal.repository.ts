import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { withdrawals } from '../config/database';

export interface WithdrawalDocument {
  _id?: any;
  fundraiserId: string;
  fundraiserName: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  fees: number;
  netAmount: number;
  currency: string;
  status: 'requested' | 'risk_check' | 'under_review' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed' | 'cancelled';
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  reason?: string;
  adminNote?: string;
  reviewerId?: string;
  paymentReference?: string;
  failureReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalFilters {
  fundraiserId?: string;
  campaignId?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class WithdrawalRepository extends BaseRepository<WithdrawalDocument> {
  constructor() {
    super(withdrawals);
  }

  async findByFundraiser(
    fundraiserId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<WithdrawalDocument>> {
    return this.findPaginated(
      { fundraiserId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findByCampaign(
    campaignId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<WithdrawalDocument>> {
    return this.findPaginated(
      { campaignId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findByFilters(
    filters: WithdrawalFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<WithdrawalDocument>> {
    const filter: any = {};
    if (filters.fundraiserId) filter.fundraiserId = filters.fundraiserId;
    if (filters.campaignId) filter.campaignId = filters.campaignId;
    if (filters.status) filter.status = filters.status;
    if (filters.minAmount || filters.maxAmount) {
      filter.amount = {};
      if (filters.minAmount) filter.amount.$gte = filters.minAmount;
      if (filters.maxAmount) filter.amount.$lte = filters.maxAmount;
    }

    const sort: Record<string, 1 | -1> = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return this.findPaginated(filter, { ...options, sort });
  }

  async updateStatus(
    withdrawalId: string,
    status: WithdrawalDocument['status'],
    adminNote?: string,
    reviewerId?: string,
    paymentReference?: string,
    failureReason?: string
  ): Promise<WithdrawalDocument | null> {
    const update: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (adminNote) update.adminNote = adminNote;
    if (reviewerId) update.reviewerId = reviewerId;
    if (paymentReference) update.paymentReference = paymentReference;
    if (failureReason) update.failureReason = failureReason;
    if (status === 'approved' || status === 'rejected' || status === 'cancelled') {
      update.reviewedAt = new Date().toISOString();
    }
    if (status === 'completed' || status === 'rejected' || status === 'failed') {
      update.processedAt = new Date().toISOString();
    }
    return this.updateById(withdrawalId, { $set: update });
  }

  async getAvailableBalance(fundraiserId: string): Promise<number> {
    const pipeline = [
      { $match: { fundraiserId, status: { $in: ['completed'] } } },
      { $group: { _id: null, totalRaised: { $sum: '$amount' } } },
    ];
    const result = await this.aggregate<{ _id: null; totalRaised: number }>(pipeline);
    const totalRaised = result[0]?.totalRaised || 0;

    const withdrawnPipeline = [
      { $match: { fundraiserId, status: { $in: ['approved', 'processing', 'completed'] } } },
      { $group: { _id: null, totalWithdrawn: { $sum: '$amount' } } },
    ];
    const withdrawnResult = await this.aggregate<{ _id: null; totalWithdrawn: number }>(withdrawnPipeline);
    const totalWithdrawn = withdrawnResult[0]?.totalWithdrawn || 0;

    return totalRaised - totalWithdrawn;
  }

  async getTotalWithdrawnByFundraiser(fundraiserId: string): Promise<number> {
    const pipeline = [
      { $match: { fundraiserId, status: { $in: ['approved', 'processing', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ];
    const result = await this.aggregate<{ _id: null; total: number }>(pipeline);
    return result[0]?.total || 0;
  }

  async getPendingTotal(): Promise<number> {
    const pipeline = [
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ];
    const result = await this.aggregate<{ _id: null; total: number }>(pipeline);
    return result[0]?.total || 0;
  }
}
