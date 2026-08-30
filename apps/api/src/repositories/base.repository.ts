import {
  type Collection,
  type Filter,
  type FindOptions,
  type UpdateFilter,
  type Sort,
} from 'mongodb';
import { paginate, paginationResponse, type PaginationOptions } from '../utils/paginate';

export interface QueryOptions extends PaginationOptions {
  sort?: Sort;
  projection?: Record<string, 1 | 0>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseRepository<T = any> {
  private _collectionFn: () => Collection;

  protected get collection(): Collection {
    return this._collectionFn();
  }

  constructor(collectionFn: () => Collection) {
    this._collectionFn = collectionFn;
  }

  async findById(id: string): Promise<T | null> {
    const { ObjectId } = await import('mongodb');
    let queryId: any = id;
    try { queryId = new ObjectId(id); } catch { /* use as string */ }
    return this.collection.findOne({ _id: queryId } as Filter<any>) as Promise<T | null>;
  }

  async findOne(filter: Filter<any>): Promise<T | null> {
    return this.collection.findOne(filter) as Promise<T | null>;
  }

  async find(filter: Filter<any>, options?: QueryOptions): Promise<T[]> {
    const findOptions: FindOptions = {};
    if (options?.sort) findOptions.sort = options.sort;
    if (options?.projection) findOptions.projection = options.projection;
    if (options?.limit) findOptions.limit = options.limit;
    if ((options as any)?.skip) findOptions.skip = (options as any).skip;
    return this.collection.find(filter, findOptions).toArray() as Promise<T[]>;
  }

  async findPaginated(filter: Filter<any>, options?: QueryOptions): Promise<PaginatedResult<T>> {
    const p = paginate(options || {});
    const total = await this.collection.countDocuments(filter);
    const data = await this.find(filter, { ...options, skip: p.skip, limit: p.limit } as any);
    return { data, pagination: paginationResponse(total, p.page, p.limit) };
  }

  async create(document: Record<string, any>): Promise<T> {
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document } as unknown as T;
  }

  async createMany(documents: Record<string, any>[]): Promise<number> {
    if (documents.length === 0) return 0;
    const result = await this.collection.insertMany(documents);
    return result.insertedCount;
  }

  async updateById(id: string, update: UpdateFilter<any>): Promise<T | null> {
    const { ObjectId } = await import('mongodb');
    let queryId: any = id;
    try { queryId = new ObjectId(id); } catch { /* use as string */ }
    return this.collection.findOneAndUpdate(
      { _id: queryId } as Filter<any>,
      update,
      { returnDocument: 'after' }
    ) as Promise<T | null>;
  }

  async updateOne(filter: Filter<any>, update: UpdateFilter<any>): Promise<T | null> {
    return this.collection.findOneAndUpdate(filter, update, {
      returnDocument: 'after',
    }) as Promise<T | null>;
  }

  async updateMany(filter: Filter<any>, update: UpdateFilter<any>): Promise<number> {
    const result = await this.collection.updateMany(filter, update);
    return result.modifiedCount;
  }

  async deleteById(id: string): Promise<boolean> {
    const { ObjectId } = await import('mongodb');
    let queryId: any = id;
    try { queryId = new ObjectId(id); } catch { /* use as string */ }
    const result = await this.collection.deleteOne({ _id: queryId } as Filter<any>);
    return result.deletedCount > 0;
  }

  async deleteOne(filter: Filter<any>): Promise<boolean> {
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  async deleteMany(filter: Filter<any>): Promise<number> {
    const result = await this.collection.deleteMany(filter);
    return result.deletedCount;
  }

  async count(filter: Filter<any> = {}): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async exists(filter: Filter<any>): Promise<boolean> {
    const count = await this.collection.countDocuments(filter, { limit: 1 });
    return count > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async aggregate<TOutput = any>(pipeline: any[]): Promise<TOutput[]> {
    return this.collection.aggregate(pipeline).toArray() as Promise<TOutput[]>;
  }
}
