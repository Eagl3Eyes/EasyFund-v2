import { CampaignService } from './campaign.service';
import { DonationService } from './donation.service';
import { UserService } from './user.service';
import { WithdrawalRepository } from '../repositories/withdrawal.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { paginate, paginateWithCount, type PaginationOptions } from '../utils/paginate';
import { auditService } from './audit.service';

export class AdminService {
  private campaignService = new CampaignService();
  private donationService = new DonationService();
  private userService = new UserService();
  private withdrawalRepo = new WithdrawalRepository();
  private notificationRepo = new NotificationRepository();

  async getDashboardStats() {
    const [campaignStats, donationStats, userStats] = await Promise.all([
      this.campaignService.getStats(),
      this.donationService.getStats(),
      this.userService.getStats(),
    ]);

    const currentYear = new Date().getFullYear();
    const [campaignMonthly, donationMonthly, userMonthly] = await Promise.all([
      this.campaignService.getMonthlyStats(currentYear),
      this.donationService.getMonthlyStats(currentYear),
      this.userService.getMonthlyStats(currentYear),
    ]);

    const pendingWithdrawals = await this.withdrawalRepo.getPendingTotal();

    const totalCampaigns = campaignStats.reduce((sum, s) => sum + s.count, 0);
    const totalDonations = donationStats.reduce((sum, s) => sum + s.count, 0);
    const totalRaised = donationStats.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalUsers = userStats.reduce((sum, s) => sum + s.count, 0);

    return {
      totals: {
        campaigns: totalCampaigns,
        donations: totalDonations,
        raised: totalRaised,
        users: totalUsers,
        pendingWithdrawals,
      },
      campaignStatusBreakdown: campaignStats,
      donationStatusBreakdown: donationStats,
      userRoleBreakdown: userStats,
      monthly: {
        campaigns: campaignMonthly,
        donations: donationMonthly,
        users: userMonthly,
      },
    };
  }

  async listUsers(filters: any, options?: PaginationOptions) {
    return this.userService.list(filters, options);
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userService.updateRole(userId, role as any);
    await auditService.log({
      action: 'user_role_changed',
      performedBy: 'admin',
      targetType: 'user',
      targetId: userId,
      details: { newRole: role },
    });
    return user;
  }

  async listCampaigns(filters: any, options?: PaginationOptions) {
    return this.campaignService.list(filters, options);
  }

  async updateCampaignStatus(campaignId: string, status: string) {
    const campaign = await this.campaignService.updateStatus(campaignId, status as any);

    await this.notificationRepo.create({
      userId: campaign.fundraiserId,
      type: 'campaign_status',
      title: `Campaign ${status}`,
      message: `Your campaign "${campaign.title}" has been ${status}.`,
      data: { campaignId, status },
      read: false,
      createdAt: new Date().toISOString(),
    } as any);

    await auditService.log({
      action: 'campaign_status_changed',
      performedBy: 'admin',
      targetType: 'campaign',
      targetId: campaignId,
      details: { status, campaignTitle: campaign.title },
    });

    return campaign;
  }

  async listVerificationRequests(options?: PaginationOptions) {
    const { verificationRequests } = await import('../config/database');
    return paginateWithCount(
      options || {},
      () => verificationRequests().countDocuments(),
      (skip, limit) =>
        verificationRequests()
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()
    );
  }

  async reviewVerification(requestId: string, status: 'approved' | 'rejected', adminNote?: string) {
    const { verificationRequests } = await import('../config/database');
    const { ObjectId } = await import('mongodb');

    const request = await verificationRequests().findOne({ _id: new ObjectId(requestId) });
    if (!request) throw new NotFoundError('Verification request not found');

    await verificationRequests().updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status, adminNote, updatedAt: new Date().toISOString() } }
    );

    if (status === 'approved' && request.userId) {
      await this.userService.updateVerification(request.userId, request.level || 'identity');
    }

    if (request.userId) {
      await this.notificationRepo.create({
        userId: request.userId,
        type: 'verification',
        title: `Verification ${status}`,
        message: `Your identity verification has been ${status}.`,
        data: { requestId, status },
        read: false,
        createdAt: new Date().toISOString(),
      } as any);
    }

    await auditService.log({
      action: `verification_${status}`,
      performedBy: 'admin',
      targetType: 'verification',
      targetId: requestId,
      details: { level: request.level, userId: request.userId },
    });

    return { status, requestId };
  }

  async listWithdrawals(filters: any, options?: PaginationOptions) {
    return this.withdrawalRepo.findByFilters(filters, options as any);
  }

  async reviewWithdrawal(
    withdrawalId: string,
    status: 'approved' | 'rejected',
    adminNote?: string
  ) {
    const withdrawal = await this.withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundError('Withdrawal not found');

    await this.withdrawalRepo.updateStatus(withdrawalId, status, adminNote);

    await this.notificationRepo.create({
      userId: withdrawal.fundraiserId,
      type: 'withdrawal',
      title: `Withdrawal ${status}`,
      message: `Your withdrawal request of $${withdrawal.amount} has been ${status}.`,
      data: { withdrawalId, status, amount: withdrawal.amount },
      read: false,
      createdAt: new Date().toISOString(),
    } as any);

    await auditService.log({
      action: `withdrawal_${status}`,
      performedBy: 'admin',
      targetType: 'withdrawal',
      targetId: withdrawalId,
      details: { amount: withdrawal.amount, fundraiserId: withdrawal.fundraiserId },
    });

    return { status, withdrawalId };
  }

  async listReports(options?: PaginationOptions) {
    const { reports } = await import('../config/database');
    return paginateWithCount(
      options || {},
      () => reports().countDocuments(),
      (skip, limit) =>
        reports()
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()
    );
  }

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminId: string) {
    const { reports } = await import('../config/database');
    const report = await reports().findOne({ _id: reportId } as any);
    if (!report) throw new NotFoundError('Report not found');

    await reports().updateOne(
      { _id: reportId } as any,
      { $set: { status, resolvedBy: adminId, resolvedAt: new Date().toISOString() } }
    );

    const { auditLogs } = await import('../config/database');
    await auditLogs().insertOne({
      action: 'report_resolved',
      performedBy: adminId,
      targetType: 'report',
      targetId: reportId,
      details: { status },
      createdAt: new Date().toISOString(),
    } as any);

    return { status, reportId };
  }

  async listAuditLogs(options?: PaginationOptions) {
    const { auditLogs } = await import('../config/database');
    return paginateWithCount(
      options || {},
      () => auditLogs().countDocuments(),
      (skip, limit) =>
        auditLogs()
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()
    );
  }
}
