import { z } from 'zod';

// ---- Auth ----
export const loginSchema = z.object({});

export const registerSchema = z.object({
  role: z.enum(['user', 'fundraiser']).optional().default('user'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

// ---- Campaigns ----
export const createCampaignSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  story: z.string().min(50).max(10000).optional(),
  category: z.string().min(1),
  image: z.string().url().optional().or(z.literal('')),
  goal: z.number().min(1).max(10000000),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  location: z.string().max(100).optional(),
  beneficiaryType: z.enum(['self', 'someone_else', 'organization', 'community']).optional(),
  beneficiaryName: z.string().min(1).max(200).optional(),
  beneficiaryRelation: z.string().min(1).max(200).optional(),
  milestones: z.array(z.object({
    percentage: z.number().min(1).max(100),
    label: z.string().min(1).max(100),
  })).optional(),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  story: z.string().min(50).max(10000).optional(),
  category: z.string().min(1).optional(),
  image: z.string().url().optional().or(z.literal('')),
  goal: z.number().min(1).max(10000000).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional(),
  location: z.string().max(100).optional(),
  status: z.enum(['draft', 'submitted', 'active', 'completed', 'cancelled']).optional(),
});

// ---- Donations ----
export const createDonationSchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().min(1).max(1000000),
  message: z.string().max(500).optional(),
  anonymous: z.boolean().optional(),
});

// ---- Comments ----
export const createCommentSchema = z.object({
  campaignId: z.string().min(1),
  content: z.string().min(1).max(1000),
  parentCommentId: z.string().optional(),
});

// ---- Campaign Updates ----
export const createCampaignUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  image: z.string().url().optional(),
});

// ---- Verification ----
export const submitVerificationSchema = z.object({
  level: z.enum(['identity', 'payout', 'organization']),
  documents: z.array(z.string().url()).optional(),
  notes: z.string().max(1000).optional(),
});

// ---- Withdrawals ----
export const createWithdrawalSchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().min(1).max(1000000),
  bankName: z.string().min(1).max(100),
  accountHolder: z.string().min(1).max(200).optional(),
  accountNumber: z.string().min(1).max(50),
  routingNumber: z.string().min(1).max(50).optional(),
  iban: z.string().max(50).optional(),
  swiftCode: z.string().max(20).optional(),
});

// ---- Reports ----
export const createReportSchema = z.object({
  targetType: z.enum(['campaign', 'comment', 'user']),
  targetId: z.string().min(1),
  reason: z.enum([
    'fraud', 'false_information', 'impersonation', 'misuse_of_funds',
    'stolen_content', 'illegal_activity', 'harassment', 'other',
  ]),
  description: z.string().min(10).max(1000),
});

// ---- Admin ----
export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'fundraiser', 'admin']),
});

export const updateCampaignStatusSchema = z.object({
  status: z.enum(['active', 'approved', 'published', 'rejected', 'suspended', 'completed', 'needs_information', 'cancelled']),
  reason: z.string().max(1000).optional(),
});

export const reviewVerificationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
});

export const reviewWithdrawalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const campaignFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    category: z.string().optional(),
    search: z.string().max(200).optional(),
    status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'published', 'active', 'needs_information', 'rejected', 'suspended', 'cancelled', 'completed']).optional(),
    minGoal: z.coerce.number().min(0).optional(),
    maxGoal: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['createdAt', 'amountRaised', 'goal', 'supportersCount', 'deadline', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

export const notificationPrefsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  donationAlerts: z.boolean().optional(),
  campaignUpdates: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed', 'escalated']),
  action: z.enum(['suspend', 'warn', 'none']).optional(),
  reason: z.string().max(1000).optional(),
});
