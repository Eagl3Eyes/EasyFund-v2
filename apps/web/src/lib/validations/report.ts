import { z } from 'zod';

export const reportSchema = z.object({
  targetType: z.enum(['campaign', 'comment', 'user']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.enum([
    'fraud',
    'false_information',
    'impersonation',
    'misuse_of_funds',
    'stolen_content',
    'illegal_activity',
    'harassment',
    'other',
  ]),
  description: z.string().min(10, 'Please provide more details').max(1000),
});

export type ReportInput = z.infer<typeof reportSchema>;
