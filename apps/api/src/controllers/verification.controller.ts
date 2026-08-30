import { type Request, type Response, type NextFunction } from 'express';
import { verificationRequests } from '../config/database';
import { paginateWithCount } from '../utils/paginate';
import { BadRequestError } from '../utils/errors';

export class VerificationController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { level, documents, notes } = req.body;

      const existing = await verificationRequests().findOne({
        userId: user.userId,
        level,
        status: { $in: ['pending', 'approved'] },
      } as any);

      if (existing) {
        throw new BadRequestError(`You already have a ${level} verification ${existing.status}`);
      }

      const request = await verificationRequests().insertOne({
        userId: user.userId,
        userEmail: user.email || '',
        level,
        documents: documents || [],
        notes: notes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      res.status(201).json({ success: true, data: { requestId: request.insertedId } });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await paginateWithCount(
        { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 },
        () => verificationRequests().countDocuments({ userId: user.userId } as any),
        (skip: number, limit: number) =>
          verificationRequests()
            .find({ userId: user.userId } as any)
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

export const verificationController = new VerificationController();
