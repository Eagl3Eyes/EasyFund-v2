import { type Request, type Response, type NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';
import { paginate } from '../utils/paginate';
import { campaigns } from '../config/database';

const campaignService = new CampaignService();

export class CampaignController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        category,
        search,
        minGoal,
        maxGoal,
        sortBy,
        sortOrder,
      } = req.query;

      const filters: any = {};
      if (category) filters.category = category;
      if (search) filters.search = search;
      if (minGoal) filters.minGoal = Number(minGoal);
      if (maxGoal) filters.maxGoal = Number(maxGoal);
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;

      const result = await campaignService.list(filters, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const data = await campaignService.getFeatured(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const data = await campaignService.getTrending(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getEndingSoon(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const data = await campaignService.getEndingSoon(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getAlmostFunded(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const data = await campaignService.getAlmostFunded(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const campaign = await campaignService.getBySlug(slug);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const campaign = await campaignService.create({
        ...req.body,
        fundraiserId: user.userId,
      });
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const campaign = await campaignService.update(id, user.userId, req.body);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      await campaignService.delete(id, user.userId);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async getSaved(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { users } = await import('../config/database');
      const { ObjectId } = await import('mongodb');

      const userDoc = await users().findOne({ _id: new ObjectId(user.userId) });
      const savedIds = userDoc?.savedCampaigns || [];

      if (savedIds.length === 0) {
        return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      }

      const { paginateWithCount } = await import('../utils/paginate');
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await paginateWithCount(
        { page, limit },
        () => campaigns().countDocuments({ _id: { $in: savedIds.map((id: string) => new ObjectId(id)) } } as any),
        (skip, limit) => campaigns().find({ _id: { $in: savedIds.map((id: string) => new ObjectId(id)) } } as any).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
      );

      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

export const campaignController = new CampaignController();
