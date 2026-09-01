import { Router } from 'express';
import { verifyJWT, verifyDonor } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import { donationController } from '../controllers/donation.controller';
import { validateBody } from '../middleware/validate';
import { createDonationSchema } from '../validators/schemas';

const router = Router();

router.post('/', verifyJWT, verifyDonor, paymentLimiter, validateBody(createDonationSchema), donationController.create);
router.get('/user/:email', verifyJWT, donationController.getByUser);
router.get('/campaign/:id', donationController.getByCampaign);
router.get('/campaign/:id/supporters', donationController.getSupporters);
router.get('/recent', donationController.getRecent);

export { router as donationRoutes };
