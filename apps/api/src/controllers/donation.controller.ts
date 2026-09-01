import { type Request, type Response, type NextFunction } from 'express';
import { DonationService } from '../services/donation.service';
import { users } from '../config/database';
import { ObjectId } from 'mongodb';

const donationService = new DonationService();

export class DonationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const userDoc = await users().findOne({ _id: new ObjectId(authUser.userId) });
      const result = await donationService.createCheckoutSession({
        ...req.body,
        userId: authUser.userId,
        userName: userDoc?.name || 'Anonymous',
        userEmail: authUser.email,
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

  async getSupporters(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await donationService.getByCampaign(id, {
        page: 1,
        limit: 100,
      });
      const supporters = result.data
        .filter((d: any) => d.status === 'completed')
        .map((d: any) => ({
          _id: d._id,
          userName: d.anonymous ? 'Anonymous' : d.userName,
          amount: d.amount,
          message: d.message,
          createdAt: d.createdAt,
        }));
      res.json({ success: true, data: supporters });
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
