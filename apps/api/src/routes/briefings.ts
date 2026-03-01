// Briefing CRUD endpoints
import { Router, Request, Response, NextFunction } from 'express';
import { BriefingRepository } from '@copyzen/shared/repositories/index.js';
import {
  CreateBriefingRequestSchema,
  UpdateBriefingRequestSchema,
  ListBriefingsQuerySchema,
} from '@copyzen/shared/schemas/index.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

/**
 * POST /briefings
 * Create a new briefing
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = CreateBriefingRequestSchema.parse(req.body);

    // Create briefing using repository
    const briefing = await BriefingRepository.create(validatedData);

    // Log creation
    // eslint-disable-next-line no-console
    console.log(`[BRIEFING_CREATED] id=${briefing.id} client_id=${validatedData.client_id} timestamp=${new Date().toISOString()}`);

    // Return 201 Created with briefing data
    res.status(201).json({
      data: briefing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /briefings/:id
 * Get a specific briefing by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid briefing ID format');
    }

    // Fetch briefing
    const briefing = await BriefingRepository.getById(id);

    if (!briefing) {
      throw new ApiError(404, 'NOT_FOUND', 'Briefing not found');
    }

    res.status(200).json({
      data: briefing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /briefings
 * List briefings (optionally filtered by client_id)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate query parameters
    const validatedQuery = ListBriefingsQuerySchema.parse(req.query);

    let briefings = [];

    if (validatedQuery.client_id) {
      // Fetch briefings for specific client
      briefings = await BriefingRepository.getByClientId(validatedQuery.client_id);
    } else {
      // This would require a getAll method - for now, error if no client_id
      throw new ApiError(
        400,
        'MISSING_CLIENT_ID',
        'client_id query parameter is required'
      );
    }

    res.status(200).json({
      data: briefings,
      count: briefings.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /briefings/:id
 * Update an existing briefing
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid briefing ID format');
    }

    // Validate request body
    const validatedData = UpdateBriefingRequestSchema.parse(req.body);

    // Check if briefing exists
    const existingBriefing = await BriefingRepository.getById(id);
    if (!existingBriefing) {
      throw new ApiError(404, 'NOT_FOUND', 'Briefing not found');
    }

    // Update briefing
    const updatedBriefing = await BriefingRepository.update(id, validatedData);

    // Log update
    // eslint-disable-next-line no-console
    console.log(`[BRIEFING_UPDATED] id=${id} timestamp=${new Date().toISOString()}`);

    res.status(200).json({
      data: updatedBriefing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /briefings/:id
 * Delete a briefing
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid briefing ID format');
    }

    // Check if briefing exists
    const existingBriefing = await BriefingRepository.getById(id);
    if (!existingBriefing) {
      throw new ApiError(404, 'NOT_FOUND', 'Briefing not found');
    }

    // Delete briefing
    await BriefingRepository.delete(id);

    // Log deletion
    // eslint-disable-next-line no-console
    console.log(`[BRIEFING_DELETED] id=${id} timestamp=${new Date().toISOString()}`);

    // Return 204 No Content (no body)
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
