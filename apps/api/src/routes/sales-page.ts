/**
 * Sales Page Routes
 * Endpoints for generating long-form sales pages
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrandProfileRepository, BriefingRepository } from '@shared/repositories/index.js';
import { generateSalesPageContent } from '../services/sales-page/generator.js';
import { ApiError } from '../middleware/error-handler.js';
import type { OfferDetails } from '../types/sales-page.js';

const router = Router();

// Request validation schemas
const GenerateSalesPageSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID'),
  offer_details: z
    .object({
      price: z.number().positive().optional(),
      price_currency: z.string().default('BRL'),
      packages: z
        .array(
          z.object({
            name: z.string(),
            price: z.number().positive(),
            features: z.array(z.string()),
            is_recommended: z.boolean().optional(),
          })
        )
        .optional(),
      guarantee: z
        .object({
          length_days: z.number().positive().default(30),
          description: z.string(),
        })
        .optional(),
      bonuses: z
        .array(
          z.object({
            name: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      deadline: z.string().optional(),
      special_limited_offer: z.boolean().optional(),
    })
    .optional(),
});

/**
 * POST /sales-page/generate
 * Generate a complete long-form sales page
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const validatedData = GenerateSalesPageSchema.parse(req.body);

    // Fetch briefing
    const briefing = await BriefingRepository.getById(validatedData.briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'BRIEFING_NOT_FOUND', 'Briefing not found');
    }

    // Fetch brand profile
    const brandProfile = await BrandProfileRepository.getById(
      validatedData.brand_profile_id
    );
    if (!brandProfile) {
      throw new ApiError(
        404,
        'BRAND_PROFILE_NOT_FOUND',
        'Brand profile not found'
      );
    }

    // Generate sales page
    const salesPageContent = await generateSalesPageContent(
      briefing,
      brandProfile,
      (briefing as any).client_id,
      validatedData.briefing_id,
      validatedData.brand_profile_id,
      validatedData.offer_details as OfferDetails | undefined
    );

    // Log success
    // eslint-disable-next-line no-console
    console.log(
      `[SALES_PAGE_CREATED] id=${salesPageContent.id} briefing_id=${validatedData.briefing_id} sections=9`
    );

    res.status(201).json({
      data: salesPageContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
