import { campaigns, users, withdrawals } from '../config/database';

/**
 * Risk assessment service for campaigns.
 * Calculates a risk score (0-100) based on various signals.
 * Score ranges: 0-30 LOW, 31-60 MEDIUM, 61-100 HIGH
 */

interface RiskSignal {
  name: string;
  score: number;
  reason: string;
}

export class RiskService {
  /**
   * Calculate risk score for a new campaign.
   * Returns { score, signals } where score is 0-100.
   */
  async assessCampaign(data: {
    fundraiserId: string;
    title: string;
    description: string;
    story: string;
    goal: number;
    category: string;
    beneficiaryType: string;
  }): Promise<{ score: number; level: 'low' | 'medium' | 'high'; signals: RiskSignal[] }> {
    const signals: RiskSignal[] = [];

    // Signal 1: New account (created < 7 days ago)
    const user = await users().findOne({ _id: data.fundraiserId } as any);
    if (user) {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        signals.push({ name: 'new_account', score: 20, reason: `Account created ${Math.floor(daysSinceCreation)} days ago` });
      }
      if (daysSinceCreation < 1) {
        signals.push({ name: 'very_new_account', score: 15, reason: 'Account created today' });
      }
    }

    // Signal 2: High goal amount
    if (data.goal > 100000) {
      signals.push({ name: 'high_goal', score: 15, reason: `Goal of $${data.goal.toLocaleString()} exceeds $100K threshold` });
    } else if (data.goal > 50000) {
      signals.push({ name: 'elevated_goal', score: 8, reason: `Goal of $${data.goal.toLocaleString()} exceeds $50K threshold` });
    }

    // Signal 3: High-risk categories
    const highRiskCategories = ['emergency', 'medical', 'legal'];
    if (highRiskCategories.includes(data.category)) {
      signals.push({ name: 'high_risk_category', score: 10, reason: `Category "${data.category}" is flagged as higher risk` });
    }

    // Signal 4: Short description (< 50 chars)
    if (data.description.length < 50) {
      signals.push({ name: 'short_description', score: 10, reason: 'Campaign description is very short' });
    }

    // Signal 5: Short story (< 200 chars)
    if (data.story.length < 200) {
      signals.push({ name: 'short_story', score: 8, reason: 'Campaign story is very short' });
    }

    // Signal 6: Duplicate title check
    const existingCampaign = await campaigns().findOne({
      title: { $regex: new RegExp(`^${data.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    } as any);
    if (existingCampaign) {
      signals.push({ name: 'duplicate_title', score: 25, reason: 'A campaign with a similar title already exists' });
    }

    // Signal 7: Beneficiary for someone else without details
    if (data.beneficiaryType === 'someone_else') {
      signals.push({ name: 'third_party_beneficiary', score: 5, reason: 'Campaign benefits a third party' });
    }

    // Signal 8: Previous campaigns by same fundraiser
    const previousCampaigns = await campaigns().countDocuments({
      fundraiserId: data.fundraiserId,
    } as any);
    if (previousCampaigns > 3) {
      signals.push({ name: 'many_campaigns', score: 8, reason: `Fundraiser has ${previousCampaigns} existing campaigns` });
    }

    // Signal 9: Previous reports on user's campaigns
    const reportedCampaigns = await campaigns().countDocuments({
      fundraiserId: data.fundraiserId,
      reportCount: { $gt: 0 },
    } as any);
    if (reportedCampaigns > 0) {
      signals.push({ name: 'previous_reports', score: 15, reason: `${reportedCampaigns} of their campaigns have been reported` });
    }

    // Calculate total score (capped at 100)
    const totalScore = Math.min(100, signals.reduce((sum, s) => sum + s.score, 0));

    let level: 'low' | 'medium' | 'high' = 'low';
    if (totalScore > 60) level = 'high';
    else if (totalScore > 30) level = 'medium';

    return { score: totalScore, level, signals };
  }

  /**
   * Calculate risk score for a withdrawal request.
   */
  async assessWithdrawal(data: {
    fundraiserId: string;
    amount: number;
    campaignId: string;
  }): Promise<{ score: number; level: 'low' | 'medium' | 'high'; signals: RiskSignal[] }> {
    const signals: RiskSignal[] = [];

    // Signal 1: Large withdrawal (>$10K)
    if (data.amount > 10000) {
      signals.push({ name: 'large_withdrawal', score: 20, reason: `Withdrawal of $${data.amount.toLocaleString()} exceeds $10K threshold` });
    } else if (data.amount > 5000) {
      signals.push({ name: 'elevated_withdrawal', score: 10, reason: `Withdrawal of $${data.amount.toLocaleString()} exceeds $5K threshold` });
    }

    // Signal 2: New account
    const user = await users().findOne({ _id: data.fundraiserId } as any);
    if (user) {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        signals.push({ name: 'new_account', score: 15, reason: `Account created ${Math.floor(daysSinceCreation)} days ago` });
      }
    }

    // Signal 3: Previous failed withdrawals
    const failedWithdrawals = await withdrawals().countDocuments({
      fundraiserId: data.fundraiserId,
      status: 'failed',
    } as any);
    if (failedWithdrawals > 0) {
      signals.push({ name: 'previous_failures', score: 15, reason: `${failedWithdrawals} previous failed withdrawal(s)` });
    }

    // Signal 4: Recent withdrawal (within 24 hours)
    const recentWithdrawal = await withdrawals().findOne({
      fundraiserId: data.fundraiserId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    } as any);
    if (recentWithdrawal) {
      signals.push({ name: 'recent_withdrawal', score: 10, reason: 'Withdrawal requested within 24 hours of previous' });
    }

    // Signal 5: Withdrawal exceeds campaign raised amount
    const campaign = await campaigns().findOne({ _id: data.campaignId } as any);
    if (campaign && data.amount > campaign.amountRaised * 0.9) {
      signals.push({ name: 'high_percentage', score: 10, reason: 'Withdrawal exceeds 90% of amount raised' });
    }

    const totalScore = Math.min(100, signals.reduce((sum, s) => sum + s.score, 0));

    let level: 'low' | 'medium' | 'high' = 'low';
    if (totalScore > 60) level = 'high';
    else if (totalScore > 30) level = 'medium';

    return { score: totalScore, level, signals };
  }
}

export const riskService = new RiskService();
