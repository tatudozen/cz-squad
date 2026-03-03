import { z } from 'zod';

/**
 * Briefing form validation schema
 * Matches the backend briefing-request.ts schema for consistency
 */
export const briefingFormSchema = z.object({
  business_name: z
    .string()
    .min(3, 'Nome do negócio deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do negócio não pode exceder 100 caracteres'),
  segment: z.enum(
    ['healthcare', 'fintech', 'ecommerce', 'education', 'saas', 'retail', 'other'],
    {
      errorMap: () => ({ message: 'Selecione um segmento válido' }),
    }
  ),
  target_audience: z
    .string()
    .min(5, 'Público-alvo deve ter pelo menos 5 caracteres')
    .max(200, 'Público-alvo não pode exceder 200 caracteres'),
  voice_tone: z.enum(
    ['professional', 'casual', 'empathetic', 'urgent', 'friendly'],
    {
      errorMap: () => ({ message: 'Selecione um tom de voz válido' }),
    }
  ),
  objectives: z
    .array(
      z.enum(
        ['increase-leads', 'boost-sales', 'build-awareness', 'educate-audience', 'other'],
        {
          errorMap: () => ({ message: 'Objetivo inválido' }),
        }
      )
    )
    .min(1, 'Selecione pelo menos um objetivo')
    .max(5, 'Máximo 5 objetivos'),
  differentiators: z
    .string()
    .min(10, 'Diferenciadores devem ter pelo menos 10 caracteres')
    .max(300, 'Diferenciadores não podem exceder 300 caracteres'),
  monthly_budget: z
    .number()
    .positive('Orçamento deve ser um número positivo')
    .optional()
    .or(z.literal('')),
});

export type BriefingFormData = z.infer<typeof briefingFormSchema>;

/**
 * Validate individual fields
 */
export const validateField = (
  fieldName: keyof BriefingFormData,
  value: unknown
): string | null => {
  try {
    const schema = briefingFormSchema.pick({ [fieldName]: true } as any);
    schema.parse({ [fieldName]: value });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Erro de validação';
    }
    return 'Erro ao validar campo';
  }
};

/**
 * Validate entire form
 */
export const validateForm = (data: unknown): { valid: boolean; errors: Record<string, string> } => {
  try {
    briefingFormSchema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: 'Erro ao validar formulário' } };
  }
};

/**
 * Objective labels for display
 */
export const OBJECTIVE_LABELS: Record<string, string> = {
  'increase-leads': 'Aumentar Leads',
  'boost-sales': 'Impulsionar Vendas',
  'build-awareness': 'Construir Presença',
  'educate-audience': 'Educar Público',
  'other': 'Outro',
};

/**
 * Segment labels for display
 */
export const SEGMENT_LABELS: Record<string, string> = {
  healthcare: 'Saúde',
  fintech: 'Fintech',
  ecommerce: 'E-commerce',
  education: 'Educação',
  saas: 'SaaS',
  retail: 'Varejo',
  other: 'Outro',
};

/**
 * Voice tone labels for display
 */
export const VOICE_TONE_LABELS: Record<string, string> = {
  professional: 'Profissional',
  casual: 'Casual',
  empathetic: 'Empático',
  urgent: 'Urgente',
  friendly: 'Amigável',
};
