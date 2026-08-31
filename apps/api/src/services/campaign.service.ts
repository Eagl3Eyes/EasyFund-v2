import { ObjectId } from 'mongodb';
import { CampaignRepository, type CampaignDocument, type CampaignFilters } from '../repositories/campaign.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';
import { generateSlug } from '../utils/slug';
import { paginate, type PaginationOptions } from '../utils/paginate';
import { riskService } from './risk.service';

export class CampaignService {
  private campaignRepo = new CampaignRepository();
  private categoryRepo = new CategoryRepository();

  async getById(id: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  async getBySlug(slug: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.findBySlug(slug);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  async list(filters: CampaignFilters, options?: PaginationOptions) {
    return this.campaignRepo.findByFilters(filters, options);
  }

  async getFeatured(limit = 6): Promise<CampaignDocument[]> {
    return this.campaignRepo.findFeatured(limit);
  }

  async getTrending(limit = 6): Promise<CampaignDocument[]> {
    return this.campaignRepo.findTrending(limit);
  }

  async getEndingSoon(limit = 6): Promise<CampaignDocument[]> {
    return this.campaignRepo.findEndingSoon(limit);
  }

  async getAlmostFunded(limit = 6): Promise<CampaignDocument[]> {
    return this.campaignRepo.findAlmostFunded(limit);
  }

  async getByFundraiser(fundraiserId: string, options?: PaginationOptions) {
    return this.campaignRepo.findByFundraiser(fundraiserId, options);
  }

  async create(data: {
    title: string;
    description: string;
    story: string;
    image: string;
    gallery?: string[];
    category: string;
    location: string;
    goal: number;
    deadline: string;
    beneficiaryType: 'self' | 'someone_else' | 'organization' | 'community';
    beneficiaryName?: string;
    beneficiaryRelation?: string;
    milestones?: CampaignDocument['milestones'];
    fundraiserId: string;
    fundraiserName: string;
    fundraiserImage: string;
    fundraiserVerified: boolean;
  }): Promise<CampaignDocument> {
    const slug = await this.generateUniqueSlug(data.title);

    const category = await this.categoryRepo.findBySlug(data.category);
    if (category) {
      await this.categoryRepo.incrementCampaignCount(category._id!);
    }

    // Run risk assessment
    const risk = await riskService.assessCampaign({
      fundraiserId: data.fundraiserId,
      title: data.title,
      description: data.description,
      story: data.story,
      goal: data.goal,
      category: data.category,
      beneficiaryType: data.beneficiaryType,
    });

    // Auto-transition: submitted -> under_review for low/medium risk
    // High risk campaigns stay submitted for manual triage
    const initialStatus = risk.level === 'high' ? 'submitted' : 'under_review';

    return this.campaignRepo.create({
      slug,
      title: data.title,
      description: data.description,
      story: data.story,
      image: data.image,
      gallery: data.gallery || [],
      category: data.category,
      location: data.location,
      status: initialStatus,
      goal: data.goal,
      amountRaised: 0,
      supportersCount: 0,
      deadline: data.deadline,
      fundraiserId: data.fundraiserId,
      fundraiserName: data.fundraiserName,
      fundraiserImage: data.fundraiserImage,
      fundraiserVerified: data.fundraiserVerified,
      beneficiaryType: data.beneficiaryType,
      beneficiaryName: data.beneficiaryName,
      beneficiaryRelation: data.beneficiaryRelation,
      milestones: data.milestones || [],
      updatesCount: 0,
      commentsCount: 0,
      riskScore: risk.score,
      reportCount: 0,
      featured: false,
      trending: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<CampaignDocument, 'title' | 'description' | 'story' | 'image' | 'gallery' | 'category' | 'location' | 'deadline' | 'milestones'>>
  ): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.fundraiserId !== userId) throw new ForbiddenError('Not your campaign');
    if (campaign.status !== 'draft' && campaign.status !== 'submitted') {
      throw new ForbiddenError('Cannot edit campaign in current status');
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (data.title) {
      updateData.title = data.title;
      updateData.slug = await this.generateUniqueSlug(data.title, id);
    }
    if (data.description) updateData.description = data.description;
    if (data.story) updateData.story = data.story;
    if (data.image) updateData.image = data.image;
    if (data.gallery) updateData.gallery = data.gallery;
    if (data.category) updateData.category = data.category;
    if (data.location) updateData.location = data.location;
    if (data.deadline) updateData.deadline = data.deadline;
    if (data.milestones) updateData.milestones = data.milestones;

    return this.campaignRepo.updateById(id, { $set: updateData }) as Promise<CampaignDocument>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.fundraiserId !== userId) throw new ForbiddenError('Not your campaign');
    if (campaign.status !== 'draft') {
      throw new ForbiddenError('Can only delete draft campaigns');
    }

    await this.campaignRepo.deleteById(id);
  }

  async updateStatus(
    id: string,
    status: CampaignDocument['status']
  ): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.updateStatus(id, status);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  async toggleFeatured(id: string, featured: boolean): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.toggleFeatured(id, featured);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  async toggleTrending(id: string, trending: boolean): Promise<CampaignDocument> {
    const campaign = await this.campaignRepo.toggleTrending(id, trending);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  async incrementAmountRaised(campaignId: string, amount: number): Promise<void> {
    await this.campaignRepo.incrementAmountRaised(campaignId, amount);
  }

  async incrementUpdateCount(campaignId: string): Promise<void> {
    await this.campaignRepo.incrementUpdateCount(campaignId);
  }

  async incrementCommentCount(campaignId: string): Promise<void> {
    await this.campaignRepo.incrementCommentCount(campaignId);
  }

  async getStats() {
    return this.campaignRepo.getStats();
  }

  async getMonthlyStats(year: number) {
    return this.campaignRepo.getMonthlyStats(year);
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = generateSlug(title);
    let counter = 0;

    while (true) {
      const existing = await this.campaignRepo.findBySlug(slug);
      if (!existing || (excludeId && existing._id?.toString() === excludeId)) {
        return slug;
      }
      counter++;
      slug = `${generateSlug(title)}-${counter}`;
    }
  }
}
