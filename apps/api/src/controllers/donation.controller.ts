import { type Request, type Response, type NextFunction } from 'express';
import { DonationService } from '../services/donation.service';

const donationService = new DonationService();

export class DonationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await donationService.createCheckoutSession({
        ...req.body,
        userId: user.userId,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params;
      const result = await donationService.getByUserEmail(email, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getByCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await donationService.getByCampaign(id, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const data = await donationService.getRecent(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const donationController = new DonationController();
