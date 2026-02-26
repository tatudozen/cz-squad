/**
 * FunWheel Routes
 * REST API endpoints for funwheel funnel stages
 *
 * Story 3.2: FunWheel Etapa R - Retenção
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /funwheel/retention
 * Capture lead from Etapa R form
 */

const captureLeadSchema = z.object({
  presentation_id: z.string().uuid(),
  brand_profile_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10,}$/),
  qualifier: z.string().optional(),
});

type CaptureLeadRequest = z.infer<typeof captureLeadSchema>;

router.post('/retention', async (req: Request, res: Response) => {
  const requestId = req.id;
  const startTime = Date.now();

  try {
    const validatedData = captureLeadSchema.parse(req.body);
    const body = validatedData as CaptureLeadRequest;

    logger.info('POST /funwheel/retention received', {
      requestId,
      email: body.email,
      presentation_id: body.presentation_id,
    });

    // Placeholder response
    const lead = {
      id: 'lead-' + Date.now(),
      presentation_id: body.presentation_id,
      brand_profile_id: body.brand_profile_id,
      client_id: 'client-123',
      name: body.name,
      email: body.email,
      phone: body.phone,
      qualifier: body.qualifier,
      lead_magnet_url: `https://storage.example.com/lead-magnets/${body.presentation_id}.pdf`,
      thank_you_page_url: `/funwheel/thank-you/${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    logger.info('Lead captured successfully', {
      requestId,
      lead_id: lead.id,
      duration_ms: duration,
    });

    return res.status(201).json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error on POST /funwheel/retention', {
        requestId,
        errors: error.errors,
      });

      return res.status(400).json({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        details: error.errors,
      });
    }

    logger.error('Lead capture failed', {
      requestId,
      error: String(error),
    });

    return res.status(500).json({
      error_code: 'LEAD_CAPTURE_FAILED',
      message: 'Failed to capture lead',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
