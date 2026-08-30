import { NotificationRepository, type NotificationDocument } from '../repositories/notification.repository';
import { users } from '../config/database';
import { sendEmail, donationConfirmationEmail, campaignApprovedEmail } from '../integrations/mail/mail.service';

export class NotificationService {
  private notificationRepo = new NotificationRepository();

  // Create a notification
  async create(data: {
    userId: string;
    type: NotificationDocument['type'];
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<NotificationDocument> {
    const notification = await this.notificationRepo.create({
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    } as any);

    // Send email for important notifications
    this.sendEmailForNotification(data.userId, data.type, data.title, data.message, data.data).catch(
      (err) => console.error('Failed to send notification email:', err)
    );

    return notification;
  }

  private async sendEmailForNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const user = await users().findOne({ _id: userId } as any);
    if (!user || !user.email) return;

    let html = '';

    switch (type) {
      case 'campaign_status':
        if (data?.status === 'active' && data?.campaignSlug) {
          html = campaignApprovedEmail({
            fundraiserName: user.name,
            campaignTitle: data.campaignTitle || '',
            campaignSlug: data.campaignSlug,
          });
        }
        break;
      case 'donation':
        if (data?.amount && data?.campaignTitle) {
          html = donationConfirmationEmail({
            donorName: data.donorName || 'Supporter',
            campaignTitle: data.campaignTitle,
            amount: data.amount,
            transactionId: data.transactionId || '',
          });
        }
        break;
      default:
        // For other notification types, use a simple template
        html = `
          <!DOCTYPE html>
          <html>
          <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}.container{max-width:600px;margin:0 auto;padding:20px;}.header{background-color:#10B981;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;}.content{background-color:#f9fafb;padding:30px;border:1px solid #e5e7eb;}.footer{background-color:#f3f4f6;padding:20px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;color:#6b7280;}</style></head>
          <body><div class="container"><div class="header"><h1>${title}</h1></div><div class="content"><p>Hi ${user.name},</p><p>${message}</p><p style="text-align:center;margin:30px 0;"><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/notifications" style="display:inline-block;background-color:#10B981;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Notifications</a></p></div><div class="footer"><p>EasyFund - Fund What Matters</p></div></div></body></html>
        `;
    }

    if (html) {
      await sendEmail({ to: user.email, subject: title, html });
    }
  }

  // Batch notify multiple users
  async createBatch(
    userIds: string[],
    type: NotificationDocument['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<number> {
    const notifications = userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    }));

    return this.notificationRepo.createMany(notifications);
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options?: { page?: number; limit?: number; unreadOnly?: boolean }
  ) {
    return this.notificationRepo.findByUser(userId, options);
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId);
  }

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepo.markAsRead(notificationId);
  }

  // Mark all as read
  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  // Predefined notification templates
  async notifyDonationReceived(
    fundraiserId: string,
    donorName: string,
    campaignTitle: string,
    amount: number
  ) {
    return this.create({
      userId: fundraiserId,
      type: 'donation',
      title: 'New Donation Received',
      message: `${donorName} donated $${amount} to "${campaignTitle}"`,
      data: { donorName, campaignTitle, amount },
    });
  }

  async notifyCampaignStatusChange(
    fundraiserId: string,
    campaignTitle: string,
    status: string
  ) {
    return this.create({
      userId: fundraiserId,
      type: 'campaign_status',
      title: `Campaign ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your campaign "${campaignTitle}" has been ${status}`,
      data: { campaignTitle, status },
    });
  }

  async notifyVerificationUpdate(
    userId: string,
    status: 'approved' | 'rejected',
    level: string
  ) {
    return this.create({
      userId,
      type: 'verification',
      title: `Verification ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${level} verification has been ${status}`,
      data: { status, level },
    });
  }

  async notifyWithdrawalUpdate(
    fundraiserId: string,
    status: 'approved' | 'rejected',
    amount: number
  ) {
    return this.create({
      userId: fundraiserId,
      type: 'withdrawal',
      title: `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your $${amount} withdrawal request has been ${status}`,
      data: { status, amount },
    });
  }

  async notifyCampaignUpdate(
    campaignId: string,
    campaignTitle: string,
    updateTitle: string
  ) {
    // Get all supporters who donated to this campaign
    const { donations } = await import('../config/database');
    const supporterEmails = await donations()
      .distinct('userEmail', { campaignId });

    // Get user IDs from emails
    const supporters = await users()
      .find({ email: { $in: supporterEmails } })
      .toArray();

    const userIds = supporters.map((s: any) => s._id.toString());

    if (userIds.length > 0) {
      return this.createBatch(
        userIds,
        'campaign_update',
        'Campaign Update',
        `New update on "${campaignTitle}": ${updateTitle}`,
        { campaignId, campaignTitle, updateTitle }
      );
    }

    return 0;
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld = 90): Promise<number> {
    return this.notificationRepo.deleteOldNotifications(daysOld);
  }
}

export const notificationService = new NotificationService();
