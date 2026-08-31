import { type Request, type Response, type NextFunction } from 'express';
import { campaignUpdateService } from '../services/campaign-update.service';
import { paginate } from '../utils/paginate';

export class CampaignUpdateController {
  async getByCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const p = paginate({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 10 });
      const result = await campaignUpdateService.getByCampaign(id, { page: p.page, limit: p.limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const update = await campaignUpdateService.create({
        campaignId: req.params.id,
        fundraiserId: user.userId,
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
      });
      res.status(201).json({ success: true, data: update });
    } catch (error) {
      next(error);
    }
  }
}

export const campaignUpdateController = new CampaignUpdateController();
