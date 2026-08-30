import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { followController } from '../controllers/follow.controller';

const router = Router();

router.post('/users/:id/follow', verifyJWT, followController.toggle);
router.get('/users/:id/following/check', verifyJWT, followController.checkFollowing);
router.get('/users/:id/followers', followController.getFollowers);
router.get('/users/:id/following', followController.getFollowing);

export { router as followRoutes };
