import { z } from 'zod';

export const withdrawalSchema = z.object({
  amount: z.number().min(10, 'Minimum withdrawal is $10').max(100_000, 'Amount is too high'),
  payoutAccountId: z.string().min(1, 'Payout account is required'),
  campaignId: z.string().optional(),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
