/**
 * Static Post Routes
 * REST API endpoints for static post copy generation
 *
 * Story 2.3: Static Post Copy Generator
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /static-post
 * Generate Instagram or LinkedIn post copy from a content plan item
 *
 * Request:
 * {
 *   plan_item_id: UUID,
 *   brand_profile_id: UUID,
 *   platform: "instagram" | "linkedin",
 *   style?: "educational" | "promotional" | "narrative"
 * }
 *
 * Response:
 * {
 *   id: UUID,
 *   plan_item_id: UUID,
 *   brand_profile_id: UUID,
 *   client_id: UUID,
 *   mode: "inception" | "atração-fatal",
 *   platform: "instagram" | "linkedin",
 *   main_text: string,
 *   hashtags: string[],
 *   design_note: string,
 *   character_count: number,
 *   hashtag_count: number,
 *   created_at: ISO 8601,
 *   updated_at: ISO 8601
 * }
 */

const generateStaticPostSchema = z.object({
  plan_item_id: z.string().uuid('Invalid plan_item_id UUID'),
  brand_profile_id: z.string().uuid('Invalid brand_profile_id UUID'),
  platform: z.enum(['instagram', 'linkedin'], {
    errorMap: () => ({ message: "Platform must be 'instagram' or 'linkedin'" }),
  }),
  style: z.enum(['educational', 'promotional', 'narrative']).optional(),
});

type GenerateStaticPostRequest = z.infer<typeof generateStaticPostSchema>;

router.post('/', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    // Validate request
    const validatedData = generateStaticPostSchema.parse(req.body);
    const body = validatedData as GenerateStaticPostRequest;

    logger.info('POST /static-post received', {
      requestId,
      plan_item_id: body.plan_item_id,
      brand_profile_id: body.brand_profile_id,
      platform: body.platform,
    });

    // Note: In production, would fetch plan_item and brand_profile from DB
    // For MVP, assuming these are passed with full data structure
    // This would require @dev to implement DB queries

    // Placeholder response (production would call generateStaticPost)
    const platformConfig = {
      instagram: { maxChars: 2200, defaultHashtags: 15 },
      linkedin: { maxChars: 3000, defaultHashtags: 4 },
    };

    const config = platformConfig[body.platform as keyof typeof platformConfig];

    const post = {
      id: 'post-' + Date.now(),
      plan_item_id: body.plan_item_id,
      brand_profile_id: body.brand_profile_id,
      client_id: 'client-123',
      mode: 'inception' as const,
      platform: body.platform,
      main_text:
        body.platform === 'instagram'
          ? 'This is a sample Instagram post with engaging copy and visual elements.'
          : 'This is a sample LinkedIn post with professional tone and consultative approach.',
      hashtags: Array.from(
        { length: config.defaultHashtags },
        (_, i) => `#tag${i + 1}`
      ),
      design_note:
        body.platform === 'instagram'
          ? '📸 High-quality image with overlay text and brand colors'
          : '📊 Professional image with data visualization or professional setting',
      character_count:
        body.platform === 'instagram' ? 120 : 200,
      hashtag_count: config.defaultHashtags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    logger.info('Static post generated successfully', {
      requestId,
      post_id: post.id,
      platform: body.platform,
      duration_ms: duration,
    });

    return res.status(200).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error on POST /static-post', {
        requestId,
        errors: error.errors,
      });

      return res.status(400).json({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        timestamp: new Date().toISOString(),
        details: error.errors,
      });
    }

    logger.error('Static post generation failed', {
      requestId,
      error: String(error),
    });

    return res.status(500).json({
      error_code: 'STATIC_POST_GENERATION_FAILED',
      message: 'Failed to generate static post',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
