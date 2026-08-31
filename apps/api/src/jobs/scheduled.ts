import { campaigns, notifications } from '../config/database';
import { notificationService } from '../services/notification.service';
import logger from '../utils/logger';

let jobs: NodeJS.Timeout[] = [];

async function autoCompleteExpiredCampaigns(): Promise<void> {
  try {
    const now = new Date().toISOString();
    const expiredCampaigns = await campaigns()
      .find({ status: 'active', deadline: { $lt: now } } as any)
      .toArray();

    for (const campaign of expiredCampaigns) {
      const reachedGoal = campaign.amountRaised >= campaign.goal;
      await campaigns().updateOne(
        { _id: campaign._id } as any,
        { $set: { status: 'completed', updatedAt: now } }
      );
      try {
        await notificationService.create({
          userId: campaign.fundraiserId,
          type: 'campaign_status',
          title: 'Campaign Ended',
          message: `Your campaign "${campaign.title}" has ended. ${reachedGoal ? 'Congratulations on reaching your goal!' : 'The campaign period has concluded.'}`,
          data: { campaignId: campaign._id?.toString(), campaignTitle: campaign.title },
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send campaign completion notification');
      }
      logger.info({ campaignId: campaign._id, title: campaign.title }, 'Auto-completed campaign');
    }

    if (expiredCampaigns.length > 0) {
      logger.info({ count: expiredCampaigns.length }, 'Auto-completed expired campaigns');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error in autoCompleteExpiredCampaigns job');
  }
}

async function autoReviewStaleSubmitted(): Promise<void> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const staleSubmitted = await campaigns()
      .find({ status: 'submitted', createdAt: { $lt: oneDayAgo } } as any)
      .toArray();

    for (const campaign of staleSubmitted) {
      await campaigns().updateOne(
        { _id: campaign._id } as any,
        { $set: { status: 'under_review', updatedAt: new Date().toISOString() } }
      );
      logger.info({ campaignId: campaign._id, title: campaign.title }, 'Auto-transitioned stale submitted campaign');
    }

    if (staleSubmitted.length > 0) {
      logger.info({ count: staleSubmitted.length }, 'Auto-transitioned stale submitted campaigns');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error in autoReviewStaleSubmitted job');
  }
}

async function cleanOldNotifications(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const result = await notifications().deleteMany({
      read: true,
      createdAt: { $lt: cutoff },
    } as any);

    if (result.deletedCount > 0) {
      logger.info({ count: result.deletedCount }, 'Cleaned old notifications');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error in cleanOldNotifications job');
  }
}

export function startScheduledJobs(): void {
  jobs.push(setInterval(autoCompleteExpiredCampaigns, 60 * 60 * 1000));
  jobs.push(setInterval(autoReviewStaleSubmitted, 60 * 60 * 1000));
  jobs.push(setInterval(cleanOldNotifications, 6 * 60 * 60 * 1000));
  autoCompleteExpiredCampaigns();
  autoReviewStaleSubmitted();
  logger.info('Scheduled jobs started');
}

export function stopScheduledJobs(): void {
  jobs.forEach(clearInterval);
  jobs = [];
  logger.info('Scheduled jobs stopped');
}
