import { type Request, type Response, type NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

const adminService = new AdminService();

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listUsers(req.query, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await adminService.updateUserRole(id, role);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async listCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listCampaigns(req.query, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async listDonations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listDonations(req.query, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async updateCampaignStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const campaign = await adminService.updateCampaignStatus(id, status);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async listVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listVerificationRequests({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async reviewVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const result = await adminService.reviewVerification(id, status, adminNote);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listWithdrawals(req.query, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async reviewWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const result = await adminService.reviewWithdrawal(id, status, adminNote);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listReports({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, action } = req.body;
      const user = (req as any).user;
      await adminService.resolveReport(req.params.id, status, user.userId);
      res.json({ success: true, message: 'Report updated' });
    } catch (error) {
      next(error);
    }
  }

  async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listAuditLogs({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
