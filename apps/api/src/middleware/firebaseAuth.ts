import { type Request, type Response, type NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import { UnauthorizedError } from '../utils/errors';

// Verify Firebase ID token from Authorization header
export async function verifyFirebaseAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No Firebase token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseToken(idToken);

    // Attach Firebase user info to request
    (req as any).firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      image: decodedToken.picture || '',
    };

    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Firebase token expired'));
    }
    if (error.code === 'auth/id-token-revoked') {
      return next(new UnauthorizedError('Firebase token revoked'));
    }
    next(new UnauthorizedError('Invalid Firebase token'));
  }
}
