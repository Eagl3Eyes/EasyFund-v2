import { CommentRepository, type CommentDocument } from '../repositories/comment.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { paginate, paginationResponse } from '../utils/paginate';

export class CommentService {
  private commentRepo = new CommentRepository();
  private campaignRepo = new CampaignRepository();

  async getByCampaign(campaignId: string, options?: { page?: number; limit?: number }) {
    const p = paginate(options || {});
    const result = await this.commentRepo.findByCampaign(campaignId, {
      page: p.page,
      limit: p.limit,
    });
    return {
      data: result.data,
      pagination: paginationResponse(result.pagination.total, p.page, p.limit),
    };
  }

  async getReplies(commentId: string, options?: { page?: number; limit?: number }) {
    const p = paginate(options || {});
    const result = await this.commentRepo.findReplies(commentId, {
      page: p.page,
      limit: p.limit,
    });
    return {
      data: result.data,
      pagination: paginationResponse(result.pagination.total, p.page, p.limit),
    };
  }

  async create(data: {
    campaignId: string;
    userId: string;
    userName: string;
    userImage: string;
    content: string;
    parentCommentId?: string;
  }): Promise<CommentDocument> {
    const campaign = await this.campaignRepo.findById(data.campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');

    if (data.parentCommentId) {
      const parent = await this.commentRepo.findById(data.parentCommentId);
      if (!parent) throw new NotFoundError('Parent comment not found');
    }

    const comment = await this.commentRepo.create({
      ...data,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    await this.campaignRepo.incrementCommentCount(data.campaignId);

    return comment;
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenError('Not authorized');

    await this.commentRepo.deleteById(commentId);
  }

  async toggleLike(commentId: string, userId: string): Promise<CommentDocument> {
    const comment = await this.commentRepo.toggleLike(commentId, userId);
    if (!comment) throw new NotFoundError('Comment not found');
    return comment;
  }

  async deleteByCampaign(campaignId: string): Promise<number> {
    return this.commentRepo.deleteByCampaign(campaignId);
  }
}

export const commentService = new CommentService();
