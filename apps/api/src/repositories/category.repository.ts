import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { categories } from '../config/database';

export interface CategoryDocument {
  _id?: any;
  name: string;
  slug: string;
  icon: string;
  description: string;
  campaignCount: number;
  color: string;
  createdAt?: string;
}

export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor() {
    super(categories);
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.findOne({ slug } as any);
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    return this.findOne({ name } as any);
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.find({}, { sort: { name: 1 } });
  }

  async incrementCampaignCount(categoryId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: categoryId } as any,
      { $inc: { campaignCount: 1 } }
    );
  }

  async decrementCampaignCount(categoryId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: categoryId } as any,
      { $inc: { campaignCount: -1 } }
    );
  }

  async getTopCategories(limit = 10): Promise<CategoryDocument[]> {
    return this.find({}, { sort: { campaignCount: -1 }, limit });
  }
}
