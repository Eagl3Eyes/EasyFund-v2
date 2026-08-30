import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { commentLimiter } from '../middleware/rateLimiter';
import { commentController } from '../controllers/comment.controller';
import { validateBody } from '../middleware/validate';
import { createCommentSchema } from '../validators/schemas';

const router = Router();

router.get('/campaigns/:id/comments', commentController.getByCampaign);
router.get('/comments/:id/replies', commentController.getReplies);
router.post('/comments', verifyJWT, commentLimiter, validateBody(createCommentSchema), commentController.create);
router.delete('/comments/:id', verifyJWT, commentController.delete);
router.post('/comments/:id/like', verifyJWT, commentController.toggleLike);

export { router as commentRoutes };
