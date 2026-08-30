import { z } from 'zod';

// ---- Auth ----
export const loginSchema = z.object({
  body: z.object({}),
});

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'fundraiser']).optional().default('user'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
  }),
});

// ---- Campaigns ----
export const createCampaignSchema = z.object({
  body: z.object({
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
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).max(2000).optional(),
    story: z.string().min(50).max(10000).optional(),
    category: z.string().min(1).optional(),
    image: z.string().url().optional().or(z.literal('')),
    goal: z.number().min(1).max(10000000).optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional(),
    location: z.string().max(100).optional(),
    status: z.enum(['draft', 'submitted', 'active', 'completed', 'cancelled']).optional(),
  }),
});

// ---- Donations ----
export const createDonationSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1),
    amount: z.number().min(1).max(1000000),
    message: z.string().max(500).optional(),
    anonymous: z.boolean().optional(),
  }),
});

// ---- Comments ----
export const createCommentSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1),
    content: z.string().min(1).max(1000),
    parentCommentId: z.string().optional(),
  }),
});

// ---- Campaign Updates ----
export const createCampaignUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    image: z.string().url().optional(),
  }),
});

// ---- Verification ----
export const submitVerificationSchema = z.object({
  body: z.object({
    level: z.enum(['identity', 'payout', 'organization']),
    documents: z.array(z.string().url()).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

// ---- Withdrawals ----
export const createWithdrawalSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1),
    amount: z.number().min(1).max(1000000),
    bankName: z.string().min(1).max(100),
    accountHolder: z.string().min(1).max(200).optional(),
    accountNumber: z.string().min(1).max(50),
    routingNumber: z.string().min(1).max(50).optional(),
    iban: z.string().max(50).optional(),
    swiftCode: z.string().max(20).optional(),
  }),
});

// ---- Reports ----
export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['campaign', 'comment', 'user']),
    targetId: z.string().min(1),
    reason: z.enum([
      'fraud', 'false_information', 'impersonation', 'misuse_of_funds',
      'stolen_content', 'illegal_activity', 'harassment', 'other',
    ]),
    description: z.string().min(10).max(1000),
  }),
});

// ---- Admin ----
export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'fundraiser', 'admin']),
  }),
});

export const updateCampaignStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'approved', 'rejected', 'suspended', 'completed', 'needs_information']),
    reason: z.string().max(1000).optional(),
  }),
});

export const reviewVerificationSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    notes: z.string().max(1000).optional(),
  }),
});

export const reviewWithdrawalSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    notes: z.string().max(1000).optional(),
  }),
});
