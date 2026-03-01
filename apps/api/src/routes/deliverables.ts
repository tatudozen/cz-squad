/**
 * Deliverable Routes
 * Endpoints for approval workflow (review, approve, reject, regenerate)
 *
 * Story 4.4: Operator Review & Approval Flow
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import deliverableRepository from '../repositories/DeliverableRepository.js';
import projectRepository from '../repositories/ProjectRepository.js';
import {
  approveDeliverable,
  rejectDeliverable,
  regenerateDeliverable,
  buildDeliveryReport,
  getProjectApprovalStatus,
} from '../services/approval/approval-workflow.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const RejectDeliverableSchema = z.object({
  feedback: z.string().min(5, 'Feedback must be at least 5 characters'),
});

const RegenerateDeliverableSchema = z.object({
  feedback: z.string().optional(),
});

// =====================================================
// ROUTES
// =====================================================

/**
 * GET /deliverables/:id
 * Get a single deliverable with full details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliverableId = req.params.id;

    if (!deliverableId || deliverableId.length < 8) {
      throw new ApiError(400, 'INVALID_DELIVERABLE_ID', 'Invalid deliverable ID format');
    }

    const deliverable = await deliverableRepository.getById(deliverableId);
    if (!deliverable) {
      throw new ApiError(404, 'DELIVERABLE_NOT_FOUND', 'Deliverable not found');
    }

    res.status(200).json({
      data: deliverable,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:projectId/deliverables
 * List all deliverables for a project
 */
router.get('/project/:projectId/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId || projectId.length < 8) {
      throw new ApiError(400, 'INVALID_PROJECT_ID', 'Invalid project ID format');
    }

    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    const summary = await deliverableRepository.getProjectDeliverablesSummary(projectId);

    res.status(200).json({
      data: {
        project_id: projectId,
        status: project.status,
        deliverables: summary.deliverables,
        summary: {
          total: summary.deliverables.length,
          approved: summary.approved_count,
          rejected: summary.rejected_count,
          pending: summary.pending_count,
          all_approved: summary.all_approved,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /deliverables/:id/approve
 * Approve a deliverable
 */
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliverableId = req.params.id;

    if (!deliverableId || deliverableId.length < 8) {
      throw new ApiError(400, 'INVALID_DELIVERABLE_ID', 'Invalid deliverable ID format');
    }

    const result = await approveDeliverable(deliverableId);

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /deliverables/:id/reject
 * Reject a deliverable with feedback
 */
router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliverableId = req.params.id;
    const validatedData = RejectDeliverableSchema.parse(req.body);

    if (!deliverableId || deliverableId.length < 8) {
      throw new ApiError(400, 'INVALID_DELIVERABLE_ID', 'Invalid deliverable ID format');
    }

    const result = await rejectDeliverable(deliverableId, validatedData.feedback);

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /deliverables/:id/regenerate
 * Regenerate a deliverable with optional feedback
 */
router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliverableId = req.params.id;
    const validatedData = RegenerateDeliverableSchema.parse(req.body);

    if (!deliverableId || deliverableId.length < 8) {
      throw new ApiError(400, 'INVALID_DELIVERABLE_ID', 'Invalid deliverable ID format');
    }

    const deliverable = await deliverableRepository.getById(deliverableId);
    if (!deliverable) {
      throw new ApiError(404, 'DELIVERABLE_NOT_FOUND', 'Deliverable not found');
    }

    // Check max regenerations
    if (deliverable.regenerations >= 2) {
      throw new ApiError(
        400,
        'MAX_REGENERATIONS_EXCEEDED',
        `Maximum regenerations (2) exceeded for this deliverable`
      );
    }

    const result = await regenerateDeliverable(deliverableId, validatedData.feedback);

    // eslint-disable-next-line no-console
    console.log(`[DELIVERABLE_REGENERATE] id=${deliverableId} feedback_provided=${!!validatedData.feedback}`);

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:projectId/report
 * Get delivery report for a project
 */
router.get('/project/:projectId/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId || projectId.length < 8) {
      throw new ApiError(400, 'INVALID_PROJECT_ID', 'Invalid project ID format');
    }

    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    const report = await buildDeliveryReport(projectId);

    res.status(200).json({
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:projectId/approval-status
 * Get current approval status summary
 */
router.get(
  '/project/:projectId/approval-status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId;

      if (!projectId || projectId.length < 8) {
        throw new ApiError(400, 'INVALID_PROJECT_ID', 'Invalid project ID format');
      }

      const project = await projectRepository.getById(projectId);
      if (!project) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
      }

      const status = await getProjectApprovalStatus(projectId);

      res.status(200).json({
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
