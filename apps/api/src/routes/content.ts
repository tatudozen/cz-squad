/**
 * Content Routes
 * REST API endpoints for content generation
 *
 * Story 2.1: Content Strategy & Planning Module
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createContentPlan } from '../services/content/index';
import contentPlanRepository from '../repositories/ContentPlanRepository';
import { BriefingRepository, BrandProfileRepository } from '@shared/repositories';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Schema for POST /content/plan request validation
 */
const createContentPlanSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing_id format'),
  brand_profile_id: z.string().uuid('Invalid brand_profile_id format'),
  total_posts: z.number().int().min(1).max(50).optional(),
  inception_ratio: z.number().min(0).max(1).optional(),
  formats: z.enum(['carousel', 'image', 'mix']).optional(),
});

type CreateContentPlanRequest = z.infer<typeof createContentPlanSchema>;

/**
 * POST /content/plan
 * Generate a content strategy plan from a briefing and brand profile
 *
 * Request body:
 * {
 *   briefing_id: UUID,
 *   brand_profile_id: UUID,
 *   total_posts?: number (1-50, default: 10),
 *   inception_ratio?: number (0-1, default: 0.7),
 *   formats?: "carousel" | "image" | "mix" (default: "mix")
 * }
 *
 * Response:
 * {
 *   id: UUID,
 *   briefing_id: UUID,
 *   brand_profile_id: UUID,
 *   client_id: UUID,
 *   status: "draft",
 *   total_posts: number,
 *   inception_posts: number,
 *   atracaofatal_posts: number,
 *   posts: [
 *     {
 *       id: UUID,
 *       post_number: number,
 *       type: "carousel" | "image",
 *       mode: "inception" | "atração-fatal",
 *       theme: string,
 *       target_platform: "instagram" | "linkedin",
 *       publish_order: number,
 *       creative_brief: string
 *     }
 *   ],
 *   created_at: ISO 8601,
 *   updated_at: ISO 8601
 * }
 */
router.post('/plan', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    // Validate request body
    const validatedData = createContentPlanSchema.parse(req.body);
    const body = validatedData as CreateContentPlanRequest;

    logger.info('POST /content/plan received', {
      requestId,
      briefing_id: body.briefing_id,
      brand_profile_id: body.brand_profile_id,
    });

    // Fetch briefing
    const briefing = await BriefingRepository.getById(body.briefing_id);
    if (!briefing) {
      logger.warn('Briefing not found', { requestId, briefing_id: body.briefing_id });
      return res.status(404).json({
        error_code: 'BRIEFING_NOT_FOUND',
        message: `Briefing with ID ${body.briefing_id} not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch brand profile
    const brandProfile = await BrandProfileRepository.getById(
      body.brand_profile_id
    );
    if (!brandProfile) {
      logger.warn('Brand profile not found', {
        requestId,
        brand_profile_id: body.brand_profile_id,
      });
      return res.status(400).json({
        error_code: 'BRAND_PROFILE_NOT_FOUND',
        message: `Brand profile with ID ${body.brand_profile_id} not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify briefing and brand profile belong to same client
    if (briefing.client_id !== brandProfile.client_id) {
      logger.warn('Briefing and brand profile do not match', {
        requestId,
        briefing_client_id: briefing.client_id,
        profile_client_id: brandProfile.client_id,
      });
      return res.status(400).json({
        error_code: 'MISMATCHED_CLIENT',
        message:
          'Briefing and brand profile must belong to the same client',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate content plan via service
    const contentPlan = await createContentPlan(
      briefing as any,
      brandProfile as any,
      briefing.client_id,
      {
        total_posts: body.total_posts,
        inception_ratio: body.inception_ratio,
        formats: body.formats,
      }
    );

    // Save to Supabase
    const savedPlan = await contentPlanRepository.saveContentPlan(contentPlan);

    const duration = Date.now() - startTime;
    logger.info('POST /content/plan completed successfully', {
      requestId,
      plan_id: savedPlan.id,
      duration_ms: duration,
      post_count: savedPlan.posts.length,
    });

    // Return response
    res.status(201).json(savedPlan);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in POST /content/plan', {
        requestId,
        errors: error.errors,
      });
      return res.status(400).json({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        details: error.errors.reduce(
          (acc, err) => {
            acc[err.path.join('.')] = err.message;
            return acc;
          },
          {} as Record<string, string>
        ),
      });
    }

    // Handle other errors
    logger.error('Error in POST /content/plan', {
      requestId,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
