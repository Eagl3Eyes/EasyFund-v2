import { Router } from 'express';
import { verifyJWT, verifyFundraiser } from '../middleware/auth';
import { campaignUpdateController } from '../controllers/campaign-update.controller';
import { validateBody } from '../middleware/validate';
import { createCampaignUpdateSchema } from '../validators/schemas';

const router = Router();

router.get('/campaigns/:id/updates', campaignUpdateController.getByCampaign);
router.post('/campaigns/:id/updates', verifyJWT, verifyFundraiser, validateBody(createCampaignUpdateSchema), campaignUpdateController.create);

export { router as campaignUpdateRoutes };
