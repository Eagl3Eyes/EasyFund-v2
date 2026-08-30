import { type Request, type Response } from 'express';
import { campaigns, donations } from '../config/database';

export class AnalyticsController {
  async getCampaignAnalytics(req: Request, res: Response) {
    const { id } = req.params;

    const campaign = await campaigns().findOne({ _id: id } as any);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }

    const totalDonations = await donations().countDocuments({ campaignId: id, status: 'completed' } as any);

    const donationStats = await donations()
      .aggregate([
        { $match: { campaignId: id, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' },
          },
        },
      ])
      .toArray();

    const stats = donationStats[0] || { totalAmount: 0, averageAmount: 0, maxAmount: 0, minAmount: 0 };

    const dailyDonations = await donations()
      .aggregate([
        { $match: { campaignId: id, status: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: { $dateFromString: { dateString: '$createdAt' } } } },
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ])
      .toArray();

    const recentDonors = await donations()
      .find({ campaignId: id, status: 'completed' } as any)
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const uniqueDonors = await donations()
      .distinct('userId', { campaignId: id, status: 'completed' } as any);

    const fundingProgress = campaign.goalAmount > 0
      ? Math.round(((campaign.amountRaised || 0) / campaign.goalAmount) * 100)
      : 0;

    const daysRemaining = campaign.deadline
      ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    res.json({
      success: true,
      data: {
        totalDonations,
        totalRaised: stats.totalAmount,
        averageDonation: Math.round(stats.averageAmount || 0),
        largestDonation: stats.maxAmount || 0,
        uniqueDonors: uniqueDonors.length,
        fundingProgress,
        daysRemaining,
        dailyDonations,
        recentDonors: recentDonors.map((d: any) => ({
          name: d.userName || 'Anonymous',
          amount: d.amount,
          date: d.createdAt,
        })),
      },
    });
  }
}

export const analyticsController = new AnalyticsController();
