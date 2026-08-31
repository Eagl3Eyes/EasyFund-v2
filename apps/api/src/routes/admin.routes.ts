import { Router } from 'express';
import { verifyJWT, verifyAdmin } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { categoryController } from '../controllers/category.controller';
import { validateBody } from '../middleware/validate';
import {
  updateUserRoleSchema,
  updateCampaignStatusSchema,
  reviewVerificationSchema,
  reviewWithdrawalSchema,
  resolveReportSchema,
} from '../validators/schemas';

const router = Router();

// All admin routes require JWT + Admin role
router.use(verifyJWT, verifyAdmin);

router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', validateBody(updateUserRoleSchema), adminController.updateUserRole);

// Campaign management
router.get('/campaigns', adminController.listCampaigns);
router.patch('/campaigns/:id/status', validateBody(updateCampaignStatusSchema), adminController.updateCampaignStatus);

// Donations
router.get('/donations', adminController.listDonations);

// Verification
router.get('/verification', adminController.listVerification);
router.patch('/verification/:id', validateBody(reviewVerificationSchema), adminController.reviewVerification);

// Withdrawals
router.get('/withdrawals', adminController.listWithdrawals);
router.patch('/withdrawals/:id', validateBody(reviewWithdrawalSchema), adminController.reviewWithdrawal);

// Reports
router.get('/reports', adminController.listReports);
router.patch('/reports/:id', validateBody(resolveReportSchema), adminController.resolveReport);

// Audit logs
router.get('/audit-logs', adminController.listAuditLogs);

// Categories
router.get('/categories', categoryController.list);
router.get('/categories/top', categoryController.getTop);

export { router as adminRoutes };
