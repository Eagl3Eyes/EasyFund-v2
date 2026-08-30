import { z } from 'zod';

export const donationSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  amount: z.number().min(1, 'Donation amount must be at least $1').max(100_000, 'Amount is too high'),
  anonymous: z.boolean().default(false),
  message: z.string().max(500, 'Message must be at most 500 characters').optional(),
});

export const donationAmountSchema = z.object({
  amount: z.number().min(1, 'Amount is required').max(100_000, 'Amount is too high'),
});

export type DonationInput = z.infer<typeof donationSchema>;
export type DonationAmountInput = z.infer<typeof donationAmountSchema>;
