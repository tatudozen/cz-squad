import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../../.env.local');
dotenv.config({ path: envPath });

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // LLM
  anthropicApiKey: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  anthropicModel: z.string().default('claude-opus-4'),

  // Supabase
  supabaseUrl: z.string().url('SUPABASE_URL must be a valid URL'),
  supabaseAnonKey: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  supabaseServiceRoleKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // n8n
  n8nApiUrl: z.string().url().optional(),
  n8nApiKey: z.string().optional(),

  // Evolution (WhatsApp)
  evolutionApiUrl: z.string().url().optional(),
  evolutionInstanceName: z.string().optional(),

  // API Server
  apiPort: z.coerce.number().default(3000),
  apiHost: z.string().default('0.0.0.0'),

  // Operator
  operatorApiKey: z.string().optional(),
});

export const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  n8nApiUrl: process.env.N8N_API_URL,
  n8nApiKey: process.env.N8N_API_KEY,
  evolutionApiUrl: process.env.EVOLUTION_API_URL,
  evolutionInstanceName: process.env.EVOLUTION_INSTANCE_NAME,
  apiPort: process.env.API_PORT,
  apiHost: process.env.API_HOST,
  operatorApiKey: process.env.OPERATOR_API_KEY,
});
