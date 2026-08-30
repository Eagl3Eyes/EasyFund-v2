import { type Request, type Response, type NextFunction } from 'express';
import { CategoryRepository } from '../repositories/category.repository';

const categoryRepo = new CategoryRepository();

export class CategoryController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepo.findAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryRepo.findBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
      }
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async getTop(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const categories = await categoryRepo.getTopCategories(limit);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
