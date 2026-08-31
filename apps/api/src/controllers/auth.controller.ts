import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

const authService = new AuthService();

export class AuthController {
  // Login with Firebase ID token
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUser = (req as any).firebaseUser;

      if (!firebaseUser) {
        throw new UnauthorizedError('Firebase authentication required');
      }

      const result = await authService.loginWithFirebaseToken(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.name,
        firebaseUser.image
      );

      // Set httpOnly cookies
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUser = (req as any).firebaseUser;

      if (!firebaseUser) {
        throw new UnauthorizedError('Firebase authentication required');
      }

      const user = await authService.register({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
        image: firebaseUser.image,
        role: req.body.role || 'user',
      });

      const result = await authService.loginWithFirebaseToken(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.name,
        firebaseUser.image
      );

      // Set httpOnly cookies
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout - clear cookies
  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ success: true, data: null });
  }

  // Get current user from JWT cookie
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Refresh tokens using refresh_token cookie
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        throw new UnauthorizedError('No refresh token');
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await authService.getNotifications(
        req.user!.userId,
        req.query.unreadOnly === 'true'
      );
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await authService.getUnreadNotificationCount(req.user!.userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.markNotificationRead(req.params.id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.markAllNotificationsRead(req.user!.userId);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  // Email verification
  async sendEmailVerification(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.sendEmailVerification(req.user!.userId);
      res.json({ success: true, data: { message: 'Verification email sent' } });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmail(req.params.token);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Notification preferences
  async updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const preferences = await authService.updateNotificationPreferences(req.user!.userId, req.body);
      res.json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
