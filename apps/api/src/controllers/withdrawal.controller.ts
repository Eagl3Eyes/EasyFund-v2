import { type Request, type Response, type NextFunction } from 'express';
import { withdrawalService } from '../services/withdrawal.service';

export class WithdrawalController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const withdrawal = await withdrawalService.create({
        ...req.body,
        fundraiserId: user.userId,
        fundraiserName: user.email || 'Fundraiser',
      });
      res.status(201).json({ success: true, data: withdrawal });
    } catch (error) {
      next(error);
    }
  }

  async getMyWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await withdrawalService.getByFundraiser(user.userId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const balance = await withdrawalService.getAvailableBalance(user.userId);
      res.json({ success: true, data: { balance } });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const withdrawal = await withdrawalService.cancel(req.params.id, user.userId);
      res.json({ success: true, data: withdrawal });
    } catch (error) {
      next(error);
    }
  }
}

export const withdrawalController = new WithdrawalController();
