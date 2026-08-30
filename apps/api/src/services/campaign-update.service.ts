import { CampaignUpdateRepository } from '../repositories/campaign-update.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { paginate, paginationResponse } from '../utils/paginate';
import { notificationService } from './notification.service';

export class CampaignUpdateService {
  private updateRepo = new CampaignUpdateRepository();
  private campaignRepo = new CampaignRepository();

  async getByCampaign(campaignId: string, options?: { page?: number; limit?: number }) {
    const p = paginate(options || {});
    const result = await this.updateRepo.findByCampaign(campaignId, {
      page: p.page,
      limit: p.limit,
    });
    return {
      data: result.data,
      pagination: paginationResponse(result.pagination.total, p.page, p.limit),
    };
  }

  async create(data: {
    campaignId: string;
    fundraiserId: string;
    title: string;
    content: string;
    image?: string;
  }) {
    const campaign = await this.campaignRepo.findById(data.campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.fundraiserId !== data.fundraiserId) throw new ForbiddenError('Not authorized');

    const update = await this.updateRepo.create({
      ...data,
      createdAt: new Date().toISOString(),
    } as any);

    await this.campaignRepo.incrementUpdateCount(data.campaignId);

    try {
      await notificationService.notifyCampaignUpdate(
        data.campaignId,
        campaign.title,
        data.title
      );
    } catch (error) {
      console.error('Failed to send campaign update notification:', error);
    }

    return update;
  }
}

export const campaignUpdateService = new CampaignUpdateService();
