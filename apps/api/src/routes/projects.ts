import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BriefingRepository, BrandProfileRepository } from '@copyzen/shared/repositories/index.js';
import { projectOrchestrator } from '../services/projects/orchestrator.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const GenerateProjectSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID')
});

/**
 * POST /projects/generate
 * Trigger full pipeline orchestration
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GenerateProjectSchema.parse(req.body);

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

    // Orchestrate pipeline
    const result = await projectOrchestrator.orchestrateFullPipeline(
      briefing as any,
      brandProfile as any,
      (briefing as any).client_id
    );

    // eslint-disable-next-line no-console
    console.log(`[PROJECT_CREATED] id=${result.project_id} status=${result.status} time=${result.total_time_ms}ms`);

    res.status(201).json({
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:id/status
 * Get project status
 */
router.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const status = await projectOrchestrator.getProjectStatus(id);

    res.json({
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
