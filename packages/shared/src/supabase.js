// Supabase Client Setup
// Centralized database access for all services
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
// Use mock for local development
const useLocalMock = process.env.NODE_ENV === 'development' && process.env.SUPABASE_URL?.startsWith('http://localhost');
// Initialize based on environment
let supabaseAdmin;
let supabaseConfig = null;
if (useLocalMock) {
    // Use mock client for development
    import('./supabase-mock.js').then((mockClient) => {
        supabaseAdmin = mockClient.supabaseAdmin;
    });
}
else {
    // Environment validation
    const supabaseEnv = z.object({
        url: z.string().url('SUPABASE_URL must be valid URL'),
        anonKey: z.string().min(1, 'SUPABASE_ANON_KEY required'),
        serviceRoleKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY required'),
    });
    supabaseConfig = supabaseEnv.parse({
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    // Service role client (backend operations)
    supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
export { supabaseAdmin };
// Anon client (frontend operations) - only if not mock
let supabase = null;
if (!useLocalMock && supabaseConfig) {
    supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
}
export { supabase };
// =====================================================
// Zod Validation Schemas
// =====================================================
export const ClientInputSchema = z.object({
    name: z.string().min(1, 'Name required').max(255),
    industry: z.string().max(100).optional(),
    contact_name: z.string().max(255).optional(),
    contact_email: z.string().email().max(255).optional(),
    contact_phone: z.string().max(20).optional(),
    website: z.string().url().optional(),
    description: z.string().optional(),
});
export const BriefingInputSchema = z.object({
    client_id: z.string().uuid('Invalid client ID'),
    business_name: z.string().min(1).max(255),
    segment: z.string().max(50).optional(),
    target_audience: z.string().optional(),
    main_problem: z.string().optional(),
    desired_transformation: z.string().optional(),
    voice_tone: z.string().max(100).optional(),
    differentiators: z.string().optional(),
    call_to_action: z.string().optional(),
    visual_references: z.string().optional(),
});
export const BrandProfileInputSchema = z.object({
    client_id: z.string().uuid(),
    briefing_id: z.string().uuid().optional(),
    colors: z.any().optional(),
    fonts: z.any().optional(),
    voice_guidelines: z.string().optional(),
    visual_style: z.string().optional(),
});
// =====================================================
// Error Handling
// =====================================================
export class SupabaseError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'SupabaseError';
    }
}
export function handleSupabaseError(error) {
    if (error instanceof Error) {
        throw new SupabaseError(error.message, 'UNKNOWN_ERROR', error);
    }
    throw new SupabaseError('Unknown database error', 'UNKNOWN_ERROR', error);
}
export default supabaseAdmin;
//# sourceMappingURL=supabase.js.map