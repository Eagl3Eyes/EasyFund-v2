import { UserRepository, type UserDocument, type UserFilters } from '../repositories/user.repository';
import { SavedCampaignRepository } from '../repositories/saved-campaign.repository';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';
import { paginate, type PaginationOptions } from '../utils/paginate';

export class UserService {
  private userRepo = new UserRepository();
  private savedCampaignRepo = new SavedCampaignRepository();

  async getById(id: string): Promise<UserDocument> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async getByFirebaseUid(firebaseUid: string): Promise<UserDocument | null> {
    return this.userRepo.findByFirebaseUid(firebaseUid);
  }

  async getByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepo.findByEmail(email);
  }

  async list(filters: UserFilters, options?: PaginationOptions) {
    return this.userRepo.findByFilters(filters, options);
  }

  async create(data: {
    firebaseUid: string;
    email: string;
    name: string;
    image?: string;
    role?: UserDocument['role'];
  }): Promise<UserDocument> {
    const existing = await this.userRepo.findByFirebaseUid(data.firebaseUid);
    if (existing) return existing;

    const emailExists = await this.userRepo.findByEmail(data.email);
    if (emailExists) throw new ConflictError('Email already registered');

    return this.userRepo.create({
      firebaseUid: data.firebaseUid,
      email: data.email,
      name: data.name,
      image: data.image || '',
      role: data.role || 'user',
      verified: false,
      verificationLevel: 'none',
      campaignCount: 0,
      totalRaised: 0,
      totalDonated: 0,
      savedCampaigns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<UserDocument, 'name' | 'image' | 'phone' | 'bio' | 'location' | 'website' | 'socialLinks'>>
  ): Promise<UserDocument> {
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;

    const user = await this.userRepo.updateById(userId, { $set: updateData });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateRole(userId: string, role: UserDocument['role']): Promise<UserDocument> {
    const user = await this.userRepo.updateRole(userId, role);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateVerification(
    userId: string,
    level: UserDocument['verificationLevel']
  ): Promise<UserDocument> {
    const user = await this.userRepo.updateVerification(userId, level);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async incrementTotalDonated(userId: string, amount: number): Promise<void> {
    await this.userRepo.incrementTotalDonated(userId, amount);
  }

  async incrementTotalRaised(userId: string, amount: number): Promise<void> {
    await this.userRepo.incrementTotalRaised(userId, amount);
  }

  async toggleSaveCampaign(userId: string, campaignId: string): Promise<{ saved: boolean }> {
    const result = await this.savedCampaignRepo.toggle(userId, campaignId);

    if (result.saved) {
      await this.userRepo.addSavedCampaign(userId, campaignId);
    } else {
      await this.userRepo.removeSavedCampaign(userId, campaignId);
    }

    return result;
  }

  async getSavedCampaigns(userId: string, options?: PaginationOptions) {
    return this.savedCampaignRepo.findByUser(userId, options);
  }

  async isCampaignSaved(userId: string, campaignId: string): Promise<boolean> {
    return this.savedCampaignRepo.isSaved(userId, campaignId);
  }

  async getStats() {
    return this.userRepo.getStats();
  }

  async getMonthlyStats(year: number) {
    return this.userRepo.getMonthlyStats(year);
  }
}
