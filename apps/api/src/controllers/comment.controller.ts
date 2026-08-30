import { type Request, type Response } from 'express';
import { commentService } from '../services/comment.service';
import { paginate } from '../utils/paginate';

export class CommentController {
  async getByCampaign(req: Request, res: Response) {
    const { id } = req.params;
    const p = paginate({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    const result = await commentService.getByCampaign(id, { page: p.page, limit: p.limit });
    res.json({ success: true, data: result });
  }

  async getReplies(req: Request, res: Response) {
    const { id } = req.params;
    const p = paginate({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 10 });
    const result = await commentService.getReplies(id, { page: p.page, limit: p.limit });
    res.json({ success: true, data: result });
  }

  async create(req: Request, res: Response) {
    const user = (req as any).user;
    const comment = await commentService.create({
      campaignId: req.body.campaignId,
      userId: user._id,
      userName: user.name,
      userImage: user.image || '',
      content: req.body.content,
      parentCommentId: req.body.parentCommentId,
    });
    res.status(201).json({ success: true, data: comment });
  }

  async delete(req: Request, res: Response) {
    const user = (req as any).user;
    await commentService.delete(req.params.id, user._id);
    res.json({ success: true, message: 'Comment deleted' });
  }

  async toggleLike(req: Request, res: Response) {
    const user = (req as any).user;
    const comment = await commentService.toggleLike(req.params.id, user._id);
    res.json({ success: true, data: comment });
  }
}

export const commentController = new CommentController();
