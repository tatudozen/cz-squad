/**
 * FunWheel Funnel Endpoints
 * Routes for managing FunWheel stages (Apresentação, Retenção, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { BrandProfileRepository, BriefingRepository } from '@copyzen/shared/repositories/index.js';
import { generatePresentation } from '../services/funwheel/generators/presentation.js';
import {
  generateQualificationQuiz,
  createQualificationResult,
} from '../services/funwheel/generators/qualification.js';
import { sendLeadNotification, EvolutionClient } from '../services/funwheel/pipeline/notification.js';
import { testWebhook } from '../services/funwheel/pipeline/webhook.js';
import { LeadEventRepository } from '../repositories/LeadEventRepository.js';
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

const WebhookTestSchema = z.object({
  webhook_url: z.string().url('Invalid webhook URL'),
  api_key: z.string().min(1, 'API key is required'),
});

const WebhookTriggerSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  presentation_id: z.string().uuid('Invalid presentation ID'),
  briefing_id: z.string().uuid('Invalid briefing ID'),
  lead_name: z.string().min(2, 'Lead name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Invalid phone format'),
  qualification_tier: z.enum(['hot', 'warm', 'cold']),
  qualification_score: z.number().min(0).max(100),
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

/**
 * POST /funwheel/webhook/test
 * Test a CRM webhook endpoint configuration
 */
router.post('/webhook/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const validatedData = WebhookTestSchema.parse(req.body);

    // Test webhook
    const result = await testWebhook(validatedData.webhook_url, validatedData.api_key);

    res.status(200).json({
      data: {
        webhook_url: validatedData.webhook_url,
        success: result.success,
        message: result.message,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /funwheel/webhook/lead-qualified
 * Trigger webhook after lead qualification
 * Sends WhatsApp notification and emits webhook to CRM
 */
router.post(
  '/webhook/lead-qualified',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request
      const validatedData = WebhookTriggerSchema.parse(req.body);

      // Get Supabase client
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const leadEventRepo = new LeadEventRepository(supabase);

      // Create lead event
      const leadEvent = await leadEventRepo.create(validatedData.lead_id, 'qualified', {
        qualification_tier: validatedData.qualification_tier,
        lead_name: validatedData.lead_name,
        email: validatedData.email,
        phone: validatedData.phone,
        campaign_id: validatedData.presentation_id,
        presentation_id: validatedData.presentation_id,
        qualification_score: validatedData.qualification_score,
      });

      // Try to send WhatsApp notification (if Evolution API configured)
      const evolutionApiKey = process.env.EVOLUTION_API_KEY;
      const evolutionInstanceId = process.env.EVOLUTION_INSTANCE_ID;

      if (evolutionApiKey && evolutionInstanceId) {
        const evolutionClient = new EvolutionClient({
          apiUrl: 'https://api.evolution.app',
          apiKey: evolutionApiKey,
          instanceId: evolutionInstanceId,
        });

        await sendLeadNotification(
          evolutionClient,
          {
            lead_name: validatedData.lead_name,
            email: validatedData.email,
            phone: validatedData.phone,
            campaign_id: validatedData.presentation_id,
            presentation_id: validatedData.presentation_id,
            qualification_tier: validatedData.qualification_tier,
            qualification_score: validatedData.qualification_score,
          },
          validatedData.qualification_tier
        );
      }

      // Log success
      // eslint-disable-next-line no-console
      console.log(
        `[WEBHOOK_TRIGGERED] lead_id=${leadEvent.lead_id} tier=${validatedData.qualification_tier}`
      );

      res.status(200).json({
        data: {
          event_id: leadEvent.id,
          lead_id: leadEvent.lead_id,
          webhook_sent: leadEvent.webhook_sent,
          message: 'Lead qualification event triggered',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
