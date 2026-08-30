import { type Request, type Response } from 'express';
import { campaignUpdateService } from '../services/campaign-update.service';
import { paginate } from '../utils/paginate';

export class CampaignUpdateController {
  async getByCampaign(req: Request, res: Response) {
    const { id } = req.params;
    const p = paginate({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 10 });
    const result = await campaignUpdateService.getByCampaign(id, { page: p.page, limit: p.limit });
    res.json({ success: true, data: result });
  }

  async create(req: Request, res: Response) {
    const user = (req as any).user;
    const update = await campaignUpdateService.create({
      campaignId: req.params.id,
      fundraiserId: user._id,
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
    });
    res.status(201).json({ success: true, data: update });
  }
}

export const campaignUpdateController = new CampaignUpdateController();
