// Copy Generation endpoints
import { Router, Request, Response, NextFunction } from 'express';
import { BrandProfileRepository, BriefingRepository } from '@shared/repositories/index.js';
import { GenerateCopyRequestSchema } from '@shared/schemas/index.js';
import { generateCopy } from '@shared/services/copywriting-service.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

/**
 * POST /copy/generate
 * Generate marketing copy based on brand profile and briefing
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GenerateCopyRequestSchema.parse(req.body);

    // Fetch brand profile
    const brandProfile = await BrandProfileRepository.getById(validatedData.brand_profile_id);
    if (!brandProfile) {
      throw new ApiError(404, 'NOT_FOUND', 'Brand profile not found');
    }

    // Verify brand profile belongs to the client
    if (brandProfile.client_id !== validatedData.client_id) {
      throw new ApiError(403, 'FORBIDDEN', 'Brand profile does not belong to this client');
    }

    // Fetch briefing to get business name and other context
    const briefing = await BriefingRepository.getById(brandProfile.briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'NOT_FOUND', 'Associated briefing not found');
    }

    // Generate copy
    const generatedCopy = await generateCopy(
      briefing.business_name || 'Business',
      briefing.target_audience || 'Audience',
      briefing.differentiators || 'Unique value',
      validatedData.copy_type,
      brandProfile
    );

    // eslint-disable-next-line no-console
    console.log(
      `[COPY_GENERATED] id=${generatedCopy.id} type=${validatedData.copy_type} client_id=${validatedData.client_id} tokens=${generatedCopy.generation_metrics.tokens_used} time_ms=${generatedCopy.generation_metrics.time_ms}`
    );

    res.status(200).json({
      data: generatedCopy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
