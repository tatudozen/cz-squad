/**
 * FunWheel Funnel Endpoints
 * Routes for managing FunWheel stages (Apresentação, Retenção, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrandProfileRepository, BriefingRepository } from '@shared/repositories/index.js';
import { generatePresentation } from '../services/funwheel/generators/presentation.js';
import {
  generateQualificationQuiz,
  createQualificationResult,
} from '../services/funwheel/generators/qualification.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

// Request validation schemas
const GeneratePresentationSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID'),
  client_id: z.string().uuid('Invalid client ID'),
});

const QualificationSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  presentation_id: z.string().uuid('Invalid presentation ID'),
  briefing_id: z.string().uuid('Invalid briefing ID'),
  responses: z.record(z.string(), z.number()),
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

/**
 * POST /funwheel/qualification
 * Generate and score a qualification quiz (Etapa T)
 */
router.post('/qualification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const validatedData = QualificationSchema.parse(req.body);

    // Fetch briefing
    const briefing = await BriefingRepository.getById(validatedData.briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'BRIEFING_NOT_FOUND', 'Briefing not found');
    }

    // Fetch brand profile by client
    const brandProfile = await BrandProfileRepository.getByClientId(briefing.client_id);
    if (!brandProfile) {
      throw new ApiError(404, 'BRAND_PROFILE_NOT_FOUND', 'Brand profile not found');
    }

    // Generate quiz
    const quiz = generateQualificationQuiz(
      briefing,
      brandProfile,
      validatedData.presentation_id,
      validatedData.briefing_id,
      briefing.client_id
    );

    // Score and create result
    const qualificationResult = createQualificationResult(
      validatedData.lead_id,
      validatedData.presentation_id,
      validatedData.briefing_id,
      quiz,
      validatedData.responses,
      briefing
    );

    // Log success
    // eslint-disable-next-line no-console
    console.log(
      `[QUALIFICATION_COMPLETED] lead_id=${validatedData.lead_id} tier=${qualificationResult.qualification_tier}`
    );

    res.status(201).json({
      data: qualificationResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
