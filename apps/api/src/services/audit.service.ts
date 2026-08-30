import { auditLogs } from '../config/database';
import { paginateWithCount, type PaginationOptions } from '../utils/paginate';

export interface AuditLogEntry {
  action: string;
  performedBy: string;
  performedByName?: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  reason?: string;
  createdAt: string;
}

export class AuditService {
  async log(data: Omit<AuditLogEntry, 'createdAt'>): Promise<void> {
    await auditLogs().insertOne({
      ...data,
      createdAt: new Date().toISOString(),
    } as any);
  }

  async list(options?: PaginationOptions) {
    return paginateWithCount(
      options || {},
      () => auditLogs().countDocuments(),
      (skip: number, limit: number) =>
        auditLogs()
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()
    );
  }

  async getByAction(action: string, options?: PaginationOptions) {
    return paginateWithCount(
      options || {},
      () => auditLogs().countDocuments({ action } as any),
      (skip: number, limit: number) =>
        auditLogs()
          .find({ action } as any)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()
    );
  }

  async getByTarget(targetType: string, targetId: string) {
    return auditLogs()
      .find({ targetType, targetId } as any)
      .sort({ createdAt: -1 })
      .toArray();
  }
}

export const auditService = new AuditService();
