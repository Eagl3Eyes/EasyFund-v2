import jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { env } from '../config/env';
import type { AuthUser } from '../middleware/auth';
import { notifications } from '../config/database';

export class AuthService {
  private userService = new UserService();

  async loginWithFirebaseToken(
    firebaseUid: string,
    email: string,
    name: string,
    image?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    let user = await this.userService.getByFirebaseUid(firebaseUid);

    if (!user) {
      user = await this.userService.create({
        firebaseUid,
        email,
        name,
        image,
      });
    }

    const authUser: AuthUser = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(authUser);
    const refreshToken = this.generateRefreshToken(authUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        verified: user.verified,
      },
    };
  }

  async register(data: {
    firebaseUid: string;
    email: string;
    name: string;
    image?: string;
    role?: 'user' | 'fundraiser';
  }) {
    return this.userService.create({
      firebaseUid: data.firebaseUid,
      email: data.email,
      name: data.name,
      image: data.image,
      role: data.role || 'user',
    });
  }

  async getMe(userId: string) {
    const user = await this.userService.getById(userId);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      verified: user.verified,
      verificationLevel: user.verificationLevel,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      website: user.website,
      socialLinks: user.socialLinks,
      campaignCount: user.campaignCount,
      totalRaised: user.totalRaised,
      totalDonated: user.totalDonated,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: {
    name?: string;
    image?: string;
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
  }) {
    return this.userService.updateProfile(userId, data);
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as AuthUser;

      const user = await this.userService.getById(decoded.userId);

      const newAccessToken = this.generateAccessToken({
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async getNotifications(userId: string, unreadOnly = false) {
    const filter: any = { userId };
    if (unreadOnly) filter.read = false;

    const result = await notifications()
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return result;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return notifications().countDocuments({ userId, read: false });
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const { ObjectId } = await import('mongodb');
    await notifications().updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await notifications().updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
  }

  private generateAccessToken(user: AuthUser): string {
    return jwt.sign(user, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRY as string,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(user: AuthUser): string {
    return jwt.sign(user, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRY as string,
    } as jwt.SignOptions);
  }
}
