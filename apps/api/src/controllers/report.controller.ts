import { type Request, type Response, type NextFunction } from 'express';
import { reports } from '../config/database';
import { paginateWithCount } from '../utils/paginate';

export class ReportController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { targetType, targetId, reason, description } = req.body;

      const existing = await reports().findOne({
        reporterId: user.userId,
        targetId,
        status: { $nin: ['resolved', 'dismissed'] },
      } as any);

      if (existing) {
        return res.status(200).json({ success: true, message: 'Report already submitted' });
      }

      const report = await reports().insertOne({
        reporterId: user.userId,
        targetType,
        targetId,
        reason,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } as any);

      res.status(201).json({ success: true, data: { reportId: report.insertedId } });
    } catch (error) {
      next(error);
    }
  }

  async getMyReports(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await paginateWithCount(
        { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 },
        () => reports().countDocuments({ reporterId: user.userId } as any),
        (skip: number, limit: number) =>
          reports()
            .find({ reporterId: user.userId } as any)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray()
      );
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
