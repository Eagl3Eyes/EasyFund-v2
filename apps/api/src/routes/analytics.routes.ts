import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/campaigns/:id/analytics', verifyJWT, analyticsController.getCampaignAnalytics);

export { router as analyticsRoutes };
