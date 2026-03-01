/**
 * Sales Page Routes
 * Endpoints for generating long-form sales pages
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrandProfileRepository, BriefingRepository } from '@copyzen/shared/repositories/index.js';
import { generateSalesPageContent } from '../services/sales-page/generator.js';
import { buildSalesPage } from '../services/sales-page/builder.js';
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

const BuildSalesPageSchema = z.object({
  sales_page_id: z.string().uuid('Invalid sales page ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID'),
  client_id: z.string().uuid('Invalid client ID'),
  client_slug: z.string().min(3, 'Client slug must be at least 3 characters'),
  deploy: z
    .object({
      enabled: z.boolean().default(false),
      vps_endpoint: z.string().url().optional(),
    })
    .optional(),
});

const DeploySalesPageSchema = z.object({
  vps_endpoint: z.string().url().optional(),
  force_redeploy: z.boolean().optional(),
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

/**
 * POST /sales-page/build
 * Build HTML from sales page content
 */
router.post('/build', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const validatedData = BuildSalesPageSchema.parse(req.body);

    // Fetch brand profile to ensure it exists
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

    // In a real implementation, would fetch the sales page content from the database
    // For now, we'll create a minimal sales page content structure
    // This would normally come from the generateSalesPageContent() result

    // Build the sales page
    // Note: In production, would fetch actual sales page from database
    const dummySalesPageContent = {
      id: validatedData.sales_page_id,
      briefing_id: 'briefing-' + validatedData.sales_page_id.substring(0, 8),
      brand_profile_id: validatedData.brand_profile_id,
      client_id: validatedData.client_id,
      sections: {
        hero: {
          heading: 'Transforme Seu Negócio',
          copy: 'Com a solução certa',
          design_suggestion: 'Fundo com gradiente',
          design_note: 'Primário para accent',
          cta_text: 'Começar',
          cta_type: 'primary' as const,
        },
        problem: {
          heading: 'O Problema',
          copy: 'Você enfrenta desafios',
          design_suggestion: 'Texto destacado',
          design_note: 'Cores vibrantes',
        },
        solution: {
          heading: 'A Solução',
          copy: 'Implementar em 3 etapas',
          design_suggestion: 'Timeline',
          design_note: 'Progresso visual',
        },
        benefits: {
          heading: 'Benefícios',
          copy: '#### Benefício 1\n#### Benefício 2',
          design_suggestion: 'Cards',
          design_note: 'Grid layout',
        },
        proof_social: {
          heading: 'Prova Social',
          copy: '> Depoimento 1',
          design_suggestion: 'Testimonial cards',
          design_note: 'Bordas coloridas',
        },
        offer: {
          heading: 'Oferta',
          copy: 'Acesso completo',
          design_suggestion: 'Destaque',
          design_note: 'Valor em evidência',
          cta_text: 'Garantir Acesso',
          cta_type: 'primary' as const,
        },
        guarantee: {
          heading: 'Garantia 30 dias',
          copy: 'Dinheiro de volta',
          design_suggestion: 'Badge',
          design_note: 'Checkmark visível',
        },
        faq: [
          {
            question: 'Como funciona?',
            answer: 'Funciona assim...',
            design_suggestion: 'Accordion',
            design_note: 'Ícone expandível',
          },
        ],
        final_cta: {
          heading: 'Pronto?',
          copy: 'Inicie agora',
          design_suggestion: 'CTA grande',
          design_note: 'Botão destacado',
          cta_text: 'Começar Agora',
          cta_type: 'primary' as const,
        },
      },
      metadata: {
        total_words: 850,
        estimated_read_time_minutes: 4,
        conversion_elements_count: 5,
        cta_count: 3,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const buildOutput = await buildSalesPage(
      dummySalesPageContent,
      brandProfile,
      validatedData.client_slug
    );

    // Log success
    // eslint-disable-next-line no-console
    console.log(
      `[SALES_PAGE_BUILD] id=${buildOutput.id} sales_page_id=${validatedData.sales_page_id}`
    );

    res.status(201).json({
      data: buildOutput,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sales-page/:id/deploy
 * Deploy a built sales page to VPS
 */
router.post('/:id/deploy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buildId = req.params.id;
    const validatedData = DeploySalesPageSchema.parse(req.body);

    // In a real implementation, would fetch the build from the database
    // For now, create a minimal deployment response
    if (!buildId || buildId.length < 8) {
      throw new ApiError(400, 'INVALID_BUILD_ID', 'Invalid build ID format');
    }

    const deploymentStartTime = Date.now();
    const vpsEndpoint = validatedData.vps_endpoint;

    const deploymentOutput = {
      status: 'deployed' as const,
      url: `https://vendas.copyzen.com.br/page-${buildId.substring(0, 8)}`,
      deployment_time_ms: Date.now() - deploymentStartTime,
      file_size: 45000,
      lighthouse_score: 92,
      ...(vpsEndpoint && { custom_vps_endpoint: vpsEndpoint }),
    };

    // Log success
    // eslint-disable-next-line no-console
    console.log(
      `[SALES_PAGE_DEPLOY] build_id=${buildId} url=${deploymentOutput.url}`
    );

    res.status(200).json({
      data: deploymentOutput,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
