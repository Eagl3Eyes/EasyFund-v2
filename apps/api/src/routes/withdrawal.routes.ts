import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import { withdrawalController } from '../controllers/withdrawal.controller';
import { validateBody } from '../middleware/validate';
import { createWithdrawalSchema } from '../validators/schemas';

const router = Router();

router.use(verifyJWT);

router.get('/balance', withdrawalController.getBalance);
router.get('/', withdrawalController.getMyWithdrawals);
router.post('/', paymentLimiter, validateBody(createWithdrawalSchema), withdrawalController.create);
router.patch('/:id/cancel', withdrawalController.cancel);

export { router as withdrawalRoutes };
