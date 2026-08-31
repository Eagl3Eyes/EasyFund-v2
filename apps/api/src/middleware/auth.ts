import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { users } from '../config/database';
import { ObjectId } from 'mongodb';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Verify JWT token (from cookie or Authorization header)
export async function verifyJWT(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Try cookie first
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    // Try Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    next(error);
  }
}

// Optional auth - doesn't fail if no token, but attaches user if valid
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthUser;
      req.user = decoded;
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
}

// Role-based authorization
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

// Check if user is admin
export function verifyAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  next();
}

// Check if user is a verified fundraiser
export async function verifyFundraiser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const user = await users().findOne({ _id: new ObjectId(req.user.userId) });

    if (!user || (user.role !== 'fundraiser' && user.role !== 'admin')) {
      throw new ForbiddenError('Fundraiser access required');
    }

    next();
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid user credentials');
  }
}

// Check if user is a regular user (donor)
export function verifyDonor(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const allowedRoles = ['user', 'fundraiser', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ForbiddenError('Donor access required');
  }

  next();
}
