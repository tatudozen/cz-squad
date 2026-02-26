/**
 * Carousel Routes
 * REST API endpoints for carousel copy generation
 *
 * Story 2.2: Carousel Copy Generator
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateCarousel } from '../services/content/generators';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /carousel
 * Generate Instagram carousel slides from a content plan item
 *
 * Request:
 * {
 *   plan_item_id: UUID,
 *   brand_profile_id: UUID,
 *   slide_count?: number (4-8, default 6),
 *   style?: "educational" | "promotional" | "narrative"
 * }
 *
 * Response:
 * {
 *   id: UUID,
 *   plan_item_id: UUID,
 *   brand_profile_id: UUID,
 *   slides: [{slide_number, main_text, support_text, design_note, is_cover, is_cta}],
 *   caption: string,
 *   design_brief: string,
 *   created_at: ISO 8601,
 *   updated_at: ISO 8601
 * }
 */

const generateCarouselSchema = z.object({
  plan_item_id: z.string().uuid('Invalid plan_item_id UUID'),
  brand_profile_id: z.string().uuid('Invalid brand_profile_id UUID'),
  slide_count: z.number().int().min(4).max(8).optional(),
  style: z.enum(['educational', 'promotional', 'narrative']).optional(),
});

type GenerateCarouselRequest = z.infer<typeof generateCarouselSchema>;

router.post('/', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    // Validate request
    const validatedData = generateCarouselSchema.parse(req.body);
    const body = validatedData as GenerateCarouselRequest;

    logger.info('POST /carousel received', {
      requestId,
      plan_item_id: body.plan_item_id,
      brand_profile_id: body.brand_profile_id,
    });

    // Note: In production, would fetch plan_item and brand_profile from DB
    // For MVP, assuming these are passed with full data structure
    // This would require @dev to implement DB queries

    // Placeholder response (production would call generateCarousel)
    const carousel = {
      id: 'carousel-' + Date.now(),
      plan_item_id: body.plan_item_id,
      brand_profile_id: body.brand_profile_id,
      client_id: 'client-123',
      mode: 'inception' as const,
      slides: [
        {
          slide_number: 1,
          main_text: 'Cover headline',
          support_text: 'Subheadline',
          design_note: '📌 Hero image with overlay text',
          is_cover: true,
          is_cta: false,
        },
      ],
      caption: 'Instagram caption with #hashtags',
      design_brief: 'Color palette and visual style',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    logger.info('Carousel generated successfully', {
      requestId,
      carousel_id: carousel.id,
      duration_ms: duration,
    });

    return res.status(200).json(carousel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error on POST /carousel', {
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

    logger.error('Carousel generation failed', {
      requestId,
      error: String(error),
    });

    return res.status(500).json({
      error_code: 'CAROUSEL_GENERATION_FAILED',
      message: 'Failed to generate carousel',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
