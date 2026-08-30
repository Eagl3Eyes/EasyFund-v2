import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { notifications } from '../config/database';

export interface NotificationDocument {
  _id?: any;
  userId: string;
  type: 'donation' | 'campaign_update' | 'campaign_status' | 'verification' | 'withdrawal' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor() {
    super(notifications);
  }

  async findByUser(
    userId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<NotificationDocument>> {
    return this.findPaginated(
      { userId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findUnreadByUser(userId: string): Promise<NotificationDocument[]> {
    return this.find(
      { userId, read: false } as any,
      { sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ userId, read: false } as any);
  }

  async markAsRead(notificationId: string): Promise<NotificationDocument | null> {
    return this.updateById(notificationId, {
      $set: { read: true },
    } as any);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.collection.updateMany(
      { userId, read: false } as any,
      { $set: { read: true } }
    );
    return result.modifiedCount;
  }

  async deleteOldNotifications(daysOld = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    return this.deleteMany({
      createdAt: { $lt: cutoff.toISOString() },
      read: true,
    } as any);
  }
}
