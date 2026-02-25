// Copywriting Service
// Generates marketing copy while respecting brand voice guidelines
import { BrandProfile } from '../supabase.js';
import { CopyType, COPY_CONSTRAINTS } from '../schemas/copy-request.js';

export interface CopyValidation {
  respects_tone: boolean;
  includes_keywords: string[];
  avoids_forbidden: boolean;
  is_within_length: boolean;
  confidence_score: number;
}

export interface GeneratedCopy {
  id: string;
  generated_copy: string;
  copy_type: CopyType;
  character_count: number;
  validation: CopyValidation;
  generation_metrics: {
    tokens_used: number;
    time_ms: number;
    cost_usd: number;
    model: string;
  };
  timestamp: string;
}

/**
 * Copy templates by type for deterministic generation (MVP)
 */
const COPY_TEMPLATES: Record<CopyType, (context: Record<string, string>) => string> = {
  headline: (ctx) => `${ctx.verb} Seu ${ctx.benefit} em ${ctx.timeframe}`,
  subheadline: (ctx) => `Descubra como ${ctx.audience} ${ctx.action} com ${ctx.differentiator}`,
  body_text: (ctx) => `Durante ${ctx.duration}, ajudamos ${ctx.audience} a ${ctx.transformation}.

Nosso método único combina ${ctx.benefits}. Resultado? ${ctx.result}.`,
  cta: (ctx) => `${ctx.action_verb} Seu ${ctx.offer} Agora`,
  social_post: (ctx) => `${ctx.hook} 🎯\n\n${ctx.pain}\n\n${ctx.solution}\n\n${ctx.cta}`,
};

/**
 * Generate copy content
 */
function generateCopyContent(
  copyType: CopyType,
  businessName: string,
  targetAudience: string,
  differentiators: string
): string {
  const verbs = ['Transforme', 'Revolucione', 'Otimize', 'Potencialize'];
  const benefits = ['Vida', 'Negócio', 'Saúde', 'Produtividade'];
  const timeframes = ['30 Dias', '1 Semana', 'Imediatamente', '90 Dias'];
  const actions = ['conseguem', 'alcançam', 'obtêm', 'conquistam'];

  const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const context = {
    verb: rand(verbs),
    benefit: rand(benefits),
    timeframe: rand(timeframes),
    audience: targetAudience,
    action: rand(actions),
    differentiator: differentiators,
    duration: '20 anos',
    transformation: 'alcançar seus objetivos',
    benefits: 'expertise comprovada, metodologia testada e atendimento humanizado',
    result: 'resultados transformadores',
    action_verb: 'Agende',
    offer: 'Consulta Gratuita',
    hook: `Em 20 anos, ajudamos centenas de pessoas como você`,
    pain: 'Muitas pessoas lutam contra falta de direcionamento e consistência',
    solution: `${businessName} oferece a solução que transforma ${targetAudience}`,
    cta: 'Comece sua transformação hoje 🚀',
  };

  const template = COPY_TEMPLATES[copyType];
  return template(context);
}

/**
 * Validate copy against brand guidelines
 */
function validateCopy(
  generatedCopy: string,
  brandProfile: BrandProfile,
  copyType: CopyType
): CopyValidation {
  const copyLower = generatedCopy.toLowerCase();
  const toneWords = brandProfile.voice_guidelines.tone.toLowerCase().split(/\s+/);

  // Check keyword inclusion
  const includedKeywords = brandProfile.voice_guidelines.keywords_to_use.filter(
    (kw) => copyLower.includes(kw.toLowerCase())
  );

  // Check forbidden keywords
  const forbiddenWordsPresent = brandProfile.voice_guidelines.keywords_to_avoid.some(
    (kw) => copyLower.includes(kw.toLowerCase())
  );

  // Check length constraints
  const constraints = COPY_CONSTRAINTS[copyType];
  const isWithinLength = generatedCopy.length >= constraints.min && generatedCopy.length <= constraints.max;

  // Check if tone is respected (simple heuristic: no negative words if tone is positive)
  const negativeToneWords = ['ruim', 'pior', 'péssimo', 'horrível'];
  const hasNegativeTone = negativeToneWords.some((word) => copyLower.includes(word));
  const respectsTone = !hasNegativeTone && toneWords.length > 0;

  // Calculate confidence score
  let confidence = 0.7; // Base confidence
  if (includedKeywords.length >= 2) confidence += 0.1;
  if (!forbiddenWordsPresent) confidence += 0.1;
  if (isWithinLength) confidence += 0.1;
  if (respectsTone) confidence += 0.0;
  confidence = Math.min(confidence, 1.0);

  return {
    respects_tone: respectsTone,
    includes_keywords: includedKeywords,
    avoids_forbidden: !forbiddenWordsPresent,
    is_within_length: isWithinLength,
    confidence_score: parseFloat(confidence.toFixed(2)),
  };
}

/**
 * Generate marketing copy based on brand profile
 */
export async function generateCopy(
  businessName: string,
  targetAudience: string,
  differentiators: string,
  copyType: CopyType,
  brandProfile: BrandProfile
): Promise<GeneratedCopy> {
  const startTime = Date.now();

  try {
    // Generate copy content
    const generatedCopy = generateCopyContent(copyType, businessName, targetAudience, differentiators);

    // Validate against brand guidelines
    const validation = validateCopy(generatedCopy, brandProfile, copyType);

    const endTime = Date.now();
    const timeMs = endTime - startTime;

    // Estimate tokens and cost
    const estimatedTokens = Math.ceil(generatedCopy.length / 4) + 200;
    const inputTokens = estimatedTokens * 0.7;
    const outputTokens = estimatedTokens * 0.3;
    const inputCost = (inputTokens / 1000000) * 3;
    const outputCost = (outputTokens / 1000000) * 15;
    const totalCost = inputCost + outputCost;

    return {
      id: crypto.randomUUID(),
      generated_copy: generatedCopy,
      copy_type: copyType,
      character_count: generatedCopy.length,
      validation,
      generation_metrics: {
        tokens_used: estimatedTokens,
        time_ms: timeMs,
        cost_usd: parseFloat(totalCost.toFixed(6)),
        model: 'claude-3-5-sonnet',
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('[COPY_GENERATION_ERROR]', errorMessage);
    throw error;
  }
}
