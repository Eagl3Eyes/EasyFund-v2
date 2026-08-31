import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { users } from '../config/database';

export interface UserDocument {
  _id?: any;
  firebaseUid: string;
  email: string;
  name: string;
  image: string;
  role: 'user' | 'fundraiser' | 'admin';
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  verified: boolean;
  verificationLevel: 'none' | 'email' | 'identity' | 'address' | 'full';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
  notificationPreferences: {
    emailNotifications: boolean;
    donationAlerts: boolean;
    campaignUpdates: boolean;
    marketingEmails: boolean;
  };
  campaignCount: number;
  totalRaised: number;
  totalDonated: number;
  savedCampaigns: string[];
  stripeConnectedAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: string;
  verified?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(users);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserDocument | null> {
    return this.findOne({ firebaseUid } as any);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email } as any);
  }

  async findByRole(
    role: UserDocument['role'],
    options?: QueryOptions
  ): Promise<PaginatedResult<UserDocument>> {
    return this.findPaginated({ role } as any, options);
  }

  async findVerified(options?: QueryOptions): Promise<PaginatedResult<UserDocument>> {
    return this.findPaginated({ verified: true } as any, options);
  }

  async search(
    query: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<UserDocument>> {
    return this.findPaginated(
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      } as any,
      options
    );
  }

  async findByFilters(
    filters: UserFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<UserDocument>> {
    const filter: any = {};

    if (filters.role) filter.role = filters.role;
    if (filters.verified !== undefined) filter.verified = filters.verified;
    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return this.findPaginated(filter, { ...options, sort });
  }

  async updateRole(
    userId: string,
    role: UserDocument['role']
  ): Promise<UserDocument | null> {
    return this.updateById(userId, {
      $set: { role, updatedAt: new Date().toISOString() },
    } as any);
  }

  async updateVerification(
    userId: string,
    level: UserDocument['verificationLevel']
  ): Promise<UserDocument | null> {
    return this.updateById(userId, {
      $set: {
        verificationLevel: level,
        verified: level !== 'none',
        updatedAt: new Date().toISOString(),
      },
    } as any);
  }

  async incrementCampaignCount(userId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $inc: { campaignCount: 1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async incrementTotalRaised(userId: string, amount: number): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $inc: { totalRaised: amount },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async incrementTotalDonated(userId: string, amount: number): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $inc: { totalDonated: amount },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async addSavedCampaign(userId: string, campaignId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $addToSet: { savedCampaigns: campaignId },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async removeSavedCampaign(userId: string, campaignId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $pull: { savedCampaigns: { $in: [campaignId] } } as any,
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<UserDocument['notificationPreferences']>
  ): Promise<UserDocument | null> {
    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (preferences.emailNotifications !== undefined) updateFields['notificationPreferences.emailNotifications'] = preferences.emailNotifications;
    if (preferences.donationAlerts !== undefined) updateFields['notificationPreferences.donationAlerts'] = preferences.donationAlerts;
    if (preferences.campaignUpdates !== undefined) updateFields['notificationPreferences.campaignUpdates'] = preferences.campaignUpdates;
    if (preferences.marketingEmails !== undefined) updateFields['notificationPreferences.marketingEmails'] = preferences.marketingEmails;

    return this.updateById(userId, { $set: updateFields } as any);
  }

  async setEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: string
  ): Promise<void> {
    await this.collection.updateOne(
      { _id: userId } as any,
      {
        $set: {
          emailVerificationToken: token,
          emailVerificationExpires: expiresAt,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  async verifyEmail(token: string): Promise<UserDocument | null> {
    const user = await this.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date().toISOString() },
    } as any);

    if (!user) return null;

    await this.collection.updateOne(
      { _id: user._id } as any,
      {
        $set: {
          emailVerified: true,
          verificationLevel: 'email',
          emailVerificationToken: undefined,
          emailVerificationExpires: undefined,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return this.findById(user._id!.toString());
  }

  async getStats() {
    const pipeline = [
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ];
    return this.aggregate<{ _id: string; count: number }>(pipeline);
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
        },
      },
      { $sort: { _id: 1 } },
    ];
    return this.aggregate<{ _id: number; count: number }>(pipeline);
  }
}
