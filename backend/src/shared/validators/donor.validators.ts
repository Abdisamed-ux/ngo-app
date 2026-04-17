import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const donationSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  paymentMethod: z.nativeEnum(PaymentMethod, { errorMap: () => ({ message: 'Invalid payment method' }) }),
  categoryId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  isAnonymous: z.boolean().default(false),
  donationDate: z.string().datetime(), // ISO 8601 string
  notes: z.string().optional()
});

export type DonationSchemaType = z.infer<typeof donationSchema>;
