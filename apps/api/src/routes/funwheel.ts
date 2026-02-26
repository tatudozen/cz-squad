/**
 * FunWheel Funnel Endpoints
 * Routes for managing FunWheel stages (Apresentação, Retenção, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrandProfileRepository, BriefingRepository } from '@shared/repositories/index.js';
import { generatePresentation } from '../services/funwheel/generators/presentation.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

// Request validation schema
const GeneratePresentationSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID'),
  client_id: z.string().uuid('Invalid client ID'),
});

/**
 * POST /funwheel/presentation
 * Generate a transformation narrative landing page (Etapa A)
 */
router.post('/presentation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const validatedData = GeneratePresentationSchema.parse(req.body);

    // Fetch briefing
    const briefing = await BriefingRepository.getById(validatedData.briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'BRIEFING_NOT_FOUND', 'Briefing not found');
    }

    // Fetch brand profile
    const brandProfile = await BrandProfileRepository.getById(validatedData.brand_profile_id);
    if (!brandProfile) {
      throw new ApiError(404, 'BRAND_PROFILE_NOT_FOUND', 'Brand profile not found');
    }

    // Generate presentation
    const presentation = await generatePresentation(
      briefing,
      brandProfile,
      validatedData.client_id,
      validatedData.briefing_id,
      validatedData.brand_profile_id
    );

    // Log success
    // eslint-disable-next-line no-console
    console.log(`[PRESENTATION_CREATED] id=${presentation.id} briefing_id=${validatedData.briefing_id}`);

    res.status(201).json({
      data: presentation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
