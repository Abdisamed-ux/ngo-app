import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  subject: z.string().min(1, 'Subject is required').max(255),
  body: z.string().min(1, 'Message body is required'),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
