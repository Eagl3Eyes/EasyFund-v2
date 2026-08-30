import rateLimit from 'express-rate-limit';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many payment requests' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Campaign creation rate limiter
export const campaignLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many campaign creation requests' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Comment rate limiter
export const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many comments' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
