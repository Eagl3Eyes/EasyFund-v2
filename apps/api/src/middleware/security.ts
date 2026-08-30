import { type Request, type Response, type NextFunction } from 'express';

// Input sanitization to prevent XSS and injection attacks
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query as any);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Security headers middleware
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}

// Request size limiter
export function requestSizeLimiter(maxSize = '10mb') {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: { code: 'REQUEST_TOO_LARGE', message: 'Request body too large' },
      });
    }

    next();
  };
}

function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.match(/^(\d+)(b|kb|mb|gb)$/i);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  return parseInt(match[1]) * (units[match[2].toLowerCase()] || 1);
}

// SQL injection patterns (for logging/alerting)
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /(CHAR\(|CONCAT\(|0x[0-9a-f]+)/i,
];

export function detectSQLInjection(req: Request, _res: Response, next: NextFunction) {
  const suspicious = checkForPatterns(req);
  if (suspicious) {
    console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.path}`);
    // In production, you might want to block or rate-limit this IP
  }
  next();
}

function checkForPatterns(req: Request): boolean {
  const checkString = (str: string) =>
    SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str));

  // Check query params
  for (const value of Object.values(req.query)) {
    if (typeof value === 'string' && checkString(value)) return true;
  }

  // Check body
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body);
    if (SQL_INJECTION_PATTERNS.some((p) => p.test(bodyStr))) return true;
  }

  return false;
}
