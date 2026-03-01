// Brand Profile CRUD endpoints
import { Router, Request, Response, NextFunction } from 'express';
import { BrandProfileRepository, BriefingRepository } from '@copyzen/shared/repositories/index.js';
import {
  CreateBrandProfileRequestSchema,
  UpdateBrandProfileRequestSchema,
} from '@copyzen/shared/schemas/index.js';
import { generateBrandProfile } from '@copyzen/shared/services/brand-profile-service.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

/**
 * POST /brand-profiles/:briefing_id/generate
 * Approve briefing and generate brand profile
 */
router.post('/:briefing_id/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { briefing_id } = req.params;
    const { approved_by } = req.body;

    if (!approved_by || typeof approved_by !== 'string') {
      throw new ApiError(400, 'MISSING_APPROVED_BY', 'approved_by is required');
    }

    // Fetch briefing
    const briefing = await BriefingRepository.getById(briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'NOT_FOUND', 'Briefing not found');
    }

    // Check if already approved
    if (briefing.status !== 'draft') {
      throw new ApiError(400, 'INVALID_STATUS', `Cannot approve briefing with status "${briefing.status}"`);
    }

    // Approve briefing
    const approvedBriefing = await BriefingRepository.approve(briefing_id, approved_by);

    // Generate brand profile
    try {
      const { profile, metrics } = await generateBrandProfile(briefing);

      // Create brand profile in database
      const brandProfile = await BrandProfileRepository.create({
        client_id: briefing.client_id,
        briefing_id: briefing_id,
        color_palette: profile.color_palette,
        voice_guidelines: profile.voice_guidelines,
        visual_style: profile.visual_style,
      });

      // eslint-disable-next-line no-console
      console.log(
        `[BRAND_PROFILE_GENERATED] id=${brandProfile.id} client_id=${briefing.client_id} tokens=${metrics.tokens_used} time_ms=${metrics.time_ms} cost_usd=${metrics.cost_usd}`
      );

      res.status(200).json({
        briefing: approvedBriefing,
        brand_profile: brandProfile,
        generation_metrics: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (generationError) {
      // If generation fails, briefing is still approved
      // eslint-disable-next-line no-console
      console.error('[GENERATION_FAILED]', generationError instanceof Error ? generationError.message : String(generationError));

      throw new ApiError(
        500,
        'GENERATION_FAILED',
        'Failed to generate brand profile',
        {
          generation_error: generationError instanceof Error ? generationError.message : String(generationError),
        }
      );
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /brand-profiles
 * Create a brand profile manually
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateBrandProfileRequestSchema.parse(req.body);

    const profile = await BrandProfileRepository.create(validatedData);

    // eslint-disable-next-line no-console
    console.log(`[BRAND_PROFILE_CREATED] id=${profile.id} client_id=${validatedData.client_id}`);

    res.status(201).json({
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /brand-profiles/:id
 * Get a brand profile by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid brand profile ID format');
    }

    const profile = await BrandProfileRepository.getById(id);

    if (!profile) {
      throw new ApiError(404, 'NOT_FOUND', 'Brand profile not found');
    }

    res.status(200).json({
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /brand-profiles?client_id=:clientId
 * List brand profiles for a client
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { client_id } = req.query;

    if (!client_id || typeof client_id !== 'string') {
      throw new ApiError(400, 'MISSING_CLIENT_ID', 'client_id query parameter is required');
    }

    if (!client_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid client ID format');
    }

    // Get most recent profile for client
    const profile = await BrandProfileRepository.getByClientId(client_id);

    res.status(200).json({
      data: profile ? [profile] : [],
      count: profile ? 1 : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /brand-profiles/:id
 * Update a brand profile
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid brand profile ID format');
    }

    const validatedData = UpdateBrandProfileRequestSchema.parse(req.body);

    const existingProfile = await BrandProfileRepository.getById(id);
    if (!existingProfile) {
      throw new ApiError(404, 'NOT_FOUND', 'Brand profile not found');
    }

    const updatedProfile = await BrandProfileRepository.update(id, validatedData);

    // eslint-disable-next-line no-console
    console.log(`[BRAND_PROFILE_UPDATED] id=${id}`);

    res.status(200).json({
      data: updatedProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /brand-profiles/:id
 * Delete a brand profile
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid brand profile ID format');
    }

    const existingProfile = await BrandProfileRepository.getById(id);
    if (!existingProfile) {
      throw new ApiError(404, 'NOT_FOUND', 'Brand profile not found');
    }

    await BrandProfileRepository.delete(id);

    // eslint-disable-next-line no-console
    console.log(`[BRAND_PROFILE_DELETED] id=${id}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
