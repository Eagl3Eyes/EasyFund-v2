import { type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.list(
        req.query as any,
        {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 20,
        }
      );
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async toggleSaveCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const result = await userService.toggleSaveCampaign(user.userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSavedCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await userService.getSavedCampaigns(user.userId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
