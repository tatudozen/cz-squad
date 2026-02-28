// Zod validation schemas for Client API requests
import { z } from 'zod';

/**
 * Create client request validation schema
 */
export const CreateClientRequestSchema = z.object({
  name: z.string().min(1, 'Client name required').max(255),
  industry: z.string().min(1).max(100).optional(),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
});

export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;

/**
 * Update client request validation schema
 */
export const UpdateClientRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  industry: z.string().max(100).optional(),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
});

export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;
