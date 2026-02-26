/**
 * Design Brief Routes
 * REST API endpoints for design brief generation
 *
 * Story 2.4: Visual Design Brief Generator
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /design-brief/carousel
 * Generate visual design brief for carousel
 *
 * Request:
 * {
 *   carousel_id: UUID,
 *   brand_profile_id: UUID
 * }
 */

const designBriefCarouselSchema = z.object({
  carousel_id: z.string().uuid('Invalid carousel_id UUID'),
  brand_profile_id: z.string().uuid('Invalid brand_profile_id UUID'),
});

type DesignBriefCarouselRequest = z.infer<typeof designBriefCarouselSchema>;

router.post('/carousel', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    // Validate request
    const validatedData = designBriefCarouselSchema.parse(req.body);
    const body = validatedData as DesignBriefCarouselRequest;

    logger.info('POST /design-brief/carousel received', {
      requestId,
      carousel_id: body.carousel_id,
      brand_profile_id: body.brand_profile_id,
    });

    // Note: In production, would fetch carousel and brand_profile from DB
    // For MVP, assuming these are passed with full data structure

    // Placeholder response
    const brief = {
      id: 'brief-' + Date.now(),
      carousel_id: body.carousel_id,
      brand_profile_id: body.brand_profile_id,
      client_id: 'client-123',
      content_type: 'carousel' as const,
      color_palette: [
        { name: 'Primary', hex: '#06164A', usage: 'Headlines, CTAs' },
        { name: 'Secondary', hex: '#6220FF', usage: 'Accents, highlights' },
        { name: 'Accent', hex: '#A1C8F7', usage: 'Supporting elements' },
      ],
      typography: {
        heading: 'Poppins Bold, 24-32px',
        body: 'Inter Regular, 14-16px',
        accent: 'Muli SemiBold, 18-20px',
      },
      spacing_guidelines: '16px base unit, 8px/16px/24px/32px scale',
      layout_guidelines: '12-column grid, mobile-first responsive',
      imagery_style: 'Modern, professional photography with overlay elements',
      slides_briefs: [
        {
          slide_number: 1,
          design_note: '📌 Hero image with overlay text',
          composition: 'Full-width hero with bottom text overlay',
          color_focus: 'Primary blue with white text',
        },
      ],
      overall_aesthetic: 'Professional, modern, trustworthy brand aesthetic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    logger.info('Design brief generated successfully', {
      requestId,
      brief_id: brief.id,
      duration_ms: duration,
    });

    return res.status(200).json(brief);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error on POST /design-brief/carousel', {
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

    logger.error('Design brief generation failed', {
      requestId,
      error: String(error),
    });

    return res.status(500).json({
      error_code: 'DESIGN_BRIEF_GENERATION_FAILED',
      message: 'Failed to generate design brief',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /design-brief/static-post
 * Generate visual design brief for static post
 *
 * Request:
 * {
 *   post_id: UUID,
 *   brand_profile_id: UUID
 * }
 */

const designBriefStaticPostSchema = z.object({
  post_id: z.string().uuid('Invalid post_id UUID'),
  brand_profile_id: z.string().uuid('Invalid brand_profile_id UUID'),
});

type DesignBriefStaticPostRequest = z.infer<typeof designBriefStaticPostSchema>;

router.post('/static-post', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    // Validate request
    const validatedData = designBriefStaticPostSchema.parse(req.body);
    const body = validatedData as DesignBriefStaticPostRequest;

    logger.info('POST /design-brief/static-post received', {
      requestId,
      post_id: body.post_id,
      brand_profile_id: body.brand_profile_id,
    });

    // Note: In production, would fetch post and brand_profile from DB

    // Placeholder response
    const brief = {
      id: 'brief-' + Date.now(),
      post_id: body.post_id,
      brand_profile_id: body.brand_profile_id,
      client_id: 'client-123',
      content_type: 'static-post' as const,
      platform: 'instagram' as const,
      color_palette: [
        { name: 'Primary', hex: '#06164A', usage: 'Main CTA buttons' },
        { name: 'Secondary', hex: '#6220FF', usage: 'Accent elements' },
        { name: 'Background', hex: '#FFFFFF', usage: 'Primary background' },
      ],
      typography: {
        heading: 'Poppins Bold, 28-32px',
        body: 'Inter Regular, 14px',
        accent: 'Muli SemiBold, 16px',
      },
      image_composition: 'Hero image (1080x1350) with 20% bottom overlay for text',
      focal_point: 'Top-left quadrant, rule of thirds intersection',
      text_overlay_guidelines: 'White text on 40% opacity black background, centered bottom',
      imagery_style: 'Bright, modern photography with warm lighting',
      responsive_notes: 'Scales to mobile (1080x1350) and desktop (1200x628)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    logger.info('Design brief generated successfully', {
      requestId,
      brief_id: brief.id,
      duration_ms: duration,
    });

    return res.status(200).json(brief);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error on POST /design-brief/static-post', {
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

    logger.error('Design brief generation failed', {
      requestId,
      error: String(error),
    });

    return res.status(500).json({
      error_code: 'DESIGN_BRIEF_GENERATION_FAILED',
      message: 'Failed to generate design brief',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
