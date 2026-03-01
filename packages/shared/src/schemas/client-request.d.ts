import { z } from 'zod';
/**
 * Create client request validation schema
 */
export declare const CreateClientRequestSchema: z.ZodObject<{
    name: z.ZodString;
    industry: z.ZodOptional<z.ZodString>;
    contact_name: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}>;
export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;
/**
 * Update client request validation schema
 */
export declare const UpdateClientRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    contact_name: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}>;
export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;
//# sourceMappingURL=client-request.d.ts.map