import { type Request, type Response } from 'express';
import { followService } from '../services/follow.service';

export class FollowController {
  async toggle(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await followService.toggle(user._id, req.params.id);
    res.json({ success: true, data: result });
  }

  async checkFollowing(req: Request, res: Response) {
    const user = (req as any).user;
    const following = await followService.isFollowing(user._id, req.params.id);
    res.json({ success: true, data: { following } });
  }

  async getFollowers(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await followService.getFollowers(req.params.id, { page, limit });
    res.json({ success: true, data: result });
  }

  async getFollowing(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await followService.getFollowing(req.params.id, { page, limit });
    res.json({ success: true, data: result });
  }
}

export const followController = new FollowController();
