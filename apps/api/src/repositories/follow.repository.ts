import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { follows } from '../config/database';

export interface FollowDocument {
  _id?: any;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export class FollowRepository extends BaseRepository<FollowDocument> {
  constructor() {
    super(follows);
  }

  async findByFollower(followerId: string, options?: QueryOptions): Promise<PaginatedResult<FollowDocument>> {
    return this.findPaginated({ followerId } as any, { ...options, sort: { createdAt: -1 } });
  }

  async findByFollowing(followingId: string, options?: QueryOptions): Promise<PaginatedResult<FollowDocument>> {
    return this.findPaginated({ followingId } as any, { ...options, sort: { createdAt: -1 } });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.exists({ followerId, followingId } as any);
  }

  async toggle(followerId: string, followingId: string): Promise<{ following: boolean }> {
    const existing = await this.findOne({ followerId, followingId } as any);
    if (existing) {
      await this.deleteById(existing._id.toString());
      return { following: false };
    } else {
      await this.create({
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
      } as any);
      return { following: true };
    }
  }
}
