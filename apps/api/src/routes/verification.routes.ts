import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { verificationController } from '../controllers/verification.controller';
import { validateBody } from '../middleware/validate';
import { submitVerificationSchema } from '../validators/schemas';

const router = Router();

router.use(verifyJWT);

router.post('/', validateBody(submitVerificationSchema), verificationController.submit);
router.get('/', verificationController.getMyRequests);

export { router as verificationRoutes };
