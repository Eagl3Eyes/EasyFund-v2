import { Router } from 'express';
import { verifyJWT, verifyFundraiser } from '../middleware/auth';
import { campaignLimiter } from '../middleware/rateLimiter';
import { campaignController } from '../controllers/campaign.controller';
import { validateBody } from '../middleware/validate';
import { createCampaignSchema, updateCampaignSchema } from '../validators/schemas';

const router = Router();

router.get('/', campaignController.list);
router.get('/featured', campaignController.getFeatured);
router.get('/trending', campaignController.getTrending);
router.get('/ending-soon', campaignController.getEndingSoon);
router.get('/almost-funded', campaignController.getAlmostFunded);
router.get('/saved', verifyJWT, campaignController.getSaved);
router.get('/:slug', campaignController.getBySlug);
router.post('/', verifyJWT, verifyFundraiser, campaignLimiter, validateBody(createCampaignSchema), campaignController.create);
router.patch('/:id', verifyJWT, verifyFundraiser, validateBody(updateCampaignSchema), campaignController.update);
router.patch('/:id/activate', verifyJWT, verifyFundraiser, campaignController.activate);
router.delete('/:id', verifyJWT, verifyFundraiser, campaignController.delete);
router.post('/:id/save', verifyJWT, async (req, res) => {
  const user = (req as any).user;
  const { UserService } = await import('../services/user.service');
  const userService = new UserService();
  const result = await userService.toggleSaveCampaign(user.userId, req.params.id);
  res.json({ success: true, data: result });
});

export { router as campaignRoutes };
