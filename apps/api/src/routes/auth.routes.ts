import { Router } from 'express';
import { verifyFirebaseAuth } from '../middleware/firebaseAuth';
import { verifyJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { registerSchema, updateProfileSchema } from '../validators/schemas';

const router = Router();

router.post('/login', authLimiter, verifyFirebaseAuth, authController.login);
router.post('/register', authLimiter, verifyFirebaseAuth, validateBody(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', verifyJWT, authController.getMe);
router.patch('/profile', verifyJWT, validateBody(updateProfileSchema), authController.updateProfile);

// Email verification
router.post('/verify-email', verifyJWT, authController.sendEmailVerification);
router.get('/verify-email/:token', authController.verifyEmail);

// Notification preferences
router.get('/notifications', verifyJWT, authController.getNotifications);
router.get('/notifications/unread-count', verifyJWT, authController.getUnreadCount);
router.patch('/notifications/:id/read', verifyJWT, authController.markNotificationRead);
router.patch('/notifications/read-all', verifyJWT, authController.markAllNotificationsRead);
router.patch('/notification-preferences', verifyJWT, authController.updateNotificationPreferences);

export { router as authRoutes };
