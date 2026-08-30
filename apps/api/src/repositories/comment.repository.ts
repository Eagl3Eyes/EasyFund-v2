import { BaseRepository, type QueryOptions, type PaginatedResult } from './base.repository';
import { comments } from '../config/database';

export interface CommentDocument {
  _id?: any;
  campaignId: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  parentCommentId?: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export class CommentRepository extends BaseRepository<CommentDocument> {
  constructor() {
    super(comments);
  }

  async findByCampaign(
    campaignId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<CommentDocument>> {
    return this.findPaginated(
      { campaignId, parentCommentId: { $exists: false } } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async findReplies(parentCommentId: string, options?: QueryOptions): Promise<PaginatedResult<CommentDocument>> {
    return this.findPaginated(
      { parentCommentId } as any,
      { ...options, sort: { createdAt: 1 } }
    );
  }

  async findByUser(userId: string, options?: QueryOptions): Promise<PaginatedResult<CommentDocument>> {
    return this.findPaginated(
      { userId } as any,
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async toggleLike(commentId: string, userId: string): Promise<CommentDocument | null> {
    const comment = await this.findById(commentId);
    if (!comment) return null;

    const likes = comment.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      return this.updateById(commentId, { $pull: { likes: userId } } as any);
    } else {
      return this.updateById(commentId, { $addToSet: { likes: userId } } as any);
    }
  }

  async deleteByCampaign(campaignId: string): Promise<number> {
    return this.deleteMany({ campaignId } as any);
  }
}
