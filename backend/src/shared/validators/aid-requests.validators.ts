import { z } from 'zod';
import { UrgencyLevel } from '@prisma/client';

export const aidRequestSchema = z.object({
  aidTypeId: z.string().uuid(),
  regionId: z.string().uuid(),
  urgency: z.nativeEnum(UrgencyLevel, { errorMap: () => ({ message: 'Invalid urgency level' }) }).default('LOW'),
  estimatedValue: z.number().positive().optional(),
  dependants: z.number().int().min(0).default(0),
  description: z.string().min(10, 'Description must be at least 10 characters long')
});

export type AidRequestSchemaType = z.infer<typeof aidRequestSchema>;
