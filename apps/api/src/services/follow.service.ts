import { FollowRepository } from '../repositories/follow.repository';
import { paginate, paginationResponse } from '../utils/paginate';

export class FollowService {
  private followRepo = new FollowRepository();

  async toggle(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }
    return this.followRepo.toggle(followerId, followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.followRepo.isFollowing(followerId, followingId);
  }

  async getFollowers(userId: string, options?: { page?: number; limit?: number }) {
    const p = paginate(options || {});
    const result = await this.followRepo.findByFollowing(userId, { page: p.page, limit: p.limit });
    return {
      data: result.data,
      pagination: paginationResponse(result.pagination.total, p.page, p.limit),
    };
  }

  async getFollowing(userId: string, options?: { page?: number; limit?: number }) {
    const p = paginate(options || {});
    const result = await this.followRepo.findByFollower(userId, { page: p.page, limit: p.limit });
    return {
      data: result.data,
      pagination: paginationResponse(result.pagination.total, p.page, p.limit),
    };
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await this.followRepo.findByFollowing(userId, { limit: 0 });
    return result.pagination.total;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await this.followRepo.findByFollower(userId, { limit: 0 });
    return result.pagination.total;
  }
}

export const followService = new FollowService();
