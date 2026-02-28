// Client CRUD endpoints
import { Router, Request, Response, NextFunction } from 'express';
import { ClientRepository } from '@shared/repositories/index.js';
import { CreateClientRequestSchema, UpdateClientRequestSchema } from '@shared/schemas/index.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

/**
 * POST /clients
 * Create a new client
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = CreateClientRequestSchema.parse(req.body);

    // Create client using repository
    const client = await ClientRepository.create(validatedData);

    // Log creation
    // eslint-disable-next-line no-console
    console.log(`[CLIENT_CREATED] id=${client.id} name=${client.name} timestamp=${new Date().toISOString()}`);

    // Return 201 Created with client data
    res.status(201).json({
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /clients/:id
 * Get a specific client by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid client ID format');
    }

    const client = await ClientRepository.getById(id);

    if (!client) {
      throw new ApiError(404, 'CLIENT_NOT_FOUND', `Client with ID ${id} not found`);
    }

    res.json({
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /clients
 * List all clients
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await ClientRepository.getAll();

    res.json({
      data: clients,
      count: clients.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /clients/:id
 * Update a client
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid client ID format');
    }

    const validatedData = UpdateClientRequestSchema.parse(req.body);
    const client = await ClientRepository.update(id, validatedData);

    // eslint-disable-next-line no-console
    console.log(`[CLIENT_UPDATED] id=${id} timestamp=${new Date().toISOString()}`);

    res.json({
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /clients/:id
 * Delete a client
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new ApiError(400, 'INVALID_UUID', 'Invalid client ID format');
    }

    await ClientRepository.delete(id);

    // eslint-disable-next-line no-console
    console.log(`[CLIENT_DELETED] id=${id} timestamp=${new Date().toISOString()}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
