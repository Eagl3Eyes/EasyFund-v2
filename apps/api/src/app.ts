import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput, securityHeaders, detectSQLInjection } from './middleware/security';
import { csrfProtection } from './middleware/csrf';
import { authRoutes } from './routes/auth.routes';
import { campaignRoutes } from './routes/campaign.routes';
import { donationRoutes } from './routes/donation.routes';
import { userRoutes } from './routes/user.routes';
import { adminRoutes } from './routes/admin.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { categoryRoutes } from './routes/category.routes';
import { commentRoutes } from './routes/comment.routes';
import { campaignUpdateRoutes } from './routes/campaign-update.routes';
import { followRoutes } from './routes/follow.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { withdrawalRoutes } from './routes/withdrawal.routes';
import { verificationRoutes } from './routes/verification.routes';
import { reportRoutes } from './routes/report.routes';

const app = express();

// Security headers
app.use(helmet());
app.use(securityHeaders);

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// Stripe webhooks need raw body (before JSON parsing)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Input sanitization
app.use(sanitizeInput);

// SQL injection detection (for logging)
app.use(detectSQLInjection);

// CSRF protection
app.use(csrfProtection);

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'EasyFund API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Public platform stats (no auth required)
app.get('/api/stats', async (_req, res) => {
  try {
    const { campaigns, donations, users } = await import('./config/database');

    const totalCampaigns = await campaigns().countDocuments({ status: 'active' } as any);
    const totalUsers = await users().countDocuments();
    const donationAgg = await donations()
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ])
      .toArray();
    const stats = donationAgg[0] || { total: 0, count: 0 };

    res.json({
      success: true,
      data: {
        totalRaised: stats.total,
        totalDonations: stats.count,
        totalCampaigns,
        totalUsers,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: { totalRaised: 0, totalDonations: 0, totalCampaigns: 0, totalUsers: 0 },
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', commentRoutes);
app.use('/api', campaignUpdateRoutes);
app.use('/api', followRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
