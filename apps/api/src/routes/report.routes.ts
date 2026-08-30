import { Router } from 'express';
import { verifyJWT } from '../middleware/auth';
import { reportController } from '../controllers/report.controller';
import { validateBody } from '../middleware/validate';
import { createReportSchema } from '../validators/schemas';

const router = Router();

router.use(verifyJWT);

router.post('/', validateBody(createReportSchema), reportController.create);
router.get('/', reportController.getMyReports);

export { router as reportRoutes };
