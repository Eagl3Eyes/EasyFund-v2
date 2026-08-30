import { z } from 'zod';

export const campaignCreateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(300, 'Description must be at most 300 characters'),
  story: z.string().min(50, 'Story must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  goal: z.number().min(10, 'Goal must be at least $10').max(10_000_000, 'Goal is too high'),
  deadline: z.string().min(1, 'Deadline is required'),
  image: z.string().url('Please provide a valid image URL').min(1, 'Campaign image is required'),
  gallery: z.array(z.string().url()).optional(),
  beneficiaryType: z.enum(['self', 'someone_else', 'organization', 'community']),
  beneficiaryName: z.string().optional(),
  beneficiaryRelation: z.string().optional(),
  faq: z
    .array(
      z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
      })
    )
    .optional(),
});

export const campaignUpdateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  content: z.string().min(10, 'Content is required'),
  images: z.array(z.string().url()).optional(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
