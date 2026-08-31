import { Router } from 'express';
import { verifyJWT, verifyFundraiser } from '../middleware/auth';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/campaigns/:id/analytics', verifyJWT, verifyFundraiser, analyticsController.getCampaignAnalytics);

export { router as analyticsRoutes };
