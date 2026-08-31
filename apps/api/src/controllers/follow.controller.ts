import { type Request, type Response, type NextFunction } from 'express';
import { followService } from '../services/follow.service';

export class FollowController {
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await followService.toggle(user.userId, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async checkFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const following = await followService.isFollowing(user.userId, req.params.id);
      res.json({ success: true, data: { following } });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await followService.getFollowers(req.params.id, { page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await followService.getFollowing(req.params.id, { page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const followController = new FollowController();
