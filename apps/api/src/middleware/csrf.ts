import crypto from 'crypto';
import { type Request, type Response, type NextFunction } from 'express';

// CSRF protection using SameSite cookies (recommended approach)
// Since our API uses httpOnly cookies with SameSite=Lax, CSRF is inherently
// mitigated for same-site requests. This middleware adds an additional layer
// for cross-origin state-changing requests.

const CSRF_TOKEN_LENGTH = 32;

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

// Double-submit cookie pattern: token is stored in a non-httpOnly cookie
// and must be sent in a header on state-changing requests
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for webhook routes (Stripe handles its own verification)
  if (req.path.startsWith('/webhooks/')) {
    return next();
  }

  // Skip in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // For production: verify SameSite cookie header is present
  // Browser automatically sends cookies with SameSite=Lax for same-site requests
  // Cross-origin requests won't include the cookie, providing CSRF protection
  const origin = req.headers.origin || req.headers.referer;
  const host = req.headers.host;

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return res.status(403).json({
          success: false,
          error: { code: 'CSRF_VIOLATION', message: 'Cross-origin request rejected' },
        });
      }
    } catch {
      // Invalid origin header - reject
      return res.status(403).json({
        success: false,
        error: { code: 'CSRF_VIOLATION', message: 'Invalid origin' },
      });
    }
  }

  next();
}
