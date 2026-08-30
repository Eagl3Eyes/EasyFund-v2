import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { userController } from '../controllers/user.controller';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../validators/schemas';

const router = Router();

router.get('/', verifyJWT, userController.list);
router.get('/saved/campaigns', verifyJWT, userController.getSavedCampaigns);
router.get('/:id', userController.getById);
router.patch('/:id', verifyJWT, validateBody(updateProfileSchema), userController.update);
router.post('/:id/save', verifyJWT, userController.toggleSaveCampaign);

export { router as userRoutes };
