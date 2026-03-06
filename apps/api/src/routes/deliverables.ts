import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { config } from '../utils/config.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

const ApproveSchema = z.object({
  feedback: z.string().optional()
});

const RejectSchema = z.object({
  feedback: z.string().min(1, 'Feedback is required for rejection')
});

const RegenerateSchema = z.object({
  feedback: z.string().min(1, 'Feedback is required for regeneration')
});

/**
 * GET /projects/:projectId/deliverables
 * Get all deliverables for a project
 */
router.get('/:projectId/deliverables', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;

    res.json({
      data: data || [],
      count: (data || []).length,
      timestamp: new Date().toISOString()
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
    const { id } = req.params;
    const validatedData = ApproveSchema.parse(req.body);

    // Update deliverable status
    const { error } = await supabase
      .from('deliverables')
      .update({
        status: 'approved',
        feedback: validatedData.feedback,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // eslint-disable-next-line no-console
    console.log(`[DELIVERABLE_APPROVED] id=${id}`);

    res.json({
      data: { id, status: 'approved' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /deliverables/:id/reject
 * Reject a deliverable
 */
router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = RejectSchema.parse(req.body);

    const { error } = await supabase
      .from('deliverables')
      .update({
        status: 'rejected',
        feedback: validatedData.feedback
      })
      .eq('id', id);

    if (error) throw error;

    // eslint-disable-next-line no-console
    console.log(`[DELIVERABLE_REJECTED] id=${id}`);

    res.json({
      data: { id, status: 'rejected', feedback: validatedData.feedback },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /deliverables/:id/regenerate
 * Regenerate a deliverable
 */
router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = RegenerateSchema.parse(req.body);

    // Fetch deliverable
    const { data: deliverable, error: fetchError } = await supabase
      .from('deliverables')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!deliverable) {
      throw new ApiError(404, 'DELIVERABLE_NOT_FOUND', 'Deliverable not found');
    }

    // Check regeneration limit
    if ((deliverable.regenerations || 0) >= 2) {
      throw new ApiError(400, 'MAX_REGENERATIONS_EXCEEDED', 'Maximum regenerations (2) reached');
    }

    // Update status and increment regenerations
    const { error } = await supabase
      .from('deliverables')
      .update({
        status: 'generating',
        feedback: validatedData.feedback,
        regenerations: (deliverable.regenerations || 0) + 1
      })
      .eq('id', id);

    if (error) throw error;

    // eslint-disable-next-line no-console
    console.log(`[DELIVERABLE_REGENERATE] id=${id} regeneration=${(deliverable.regenerations || 0) + 1}`);

    res.json({
      data: {
        id,
        status: 'generating',
        regenerations: (deliverable.regenerations || 0) + 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:projectId/report
 * Get delivery report for a project
 */
router.get('/:projectId/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch deliverables
    const { data: deliverables, error: delError } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId);

    if (delError) throw delError;

    const approved = (deliverables || []).filter(d => d.status === 'approved').length;
    const total = (deliverables || []).length;
    const completionPercent = total > 0 ? Math.round((approved / total) * 100) : 0;

    res.json({
      data: {
        project_id: projectId,
        status: project.status,
        completion_percent: completionPercent,
        deliverables: {
          total,
          approved,
          rejected: (deliverables || []).filter(d => d.status === 'rejected').length,
          pending: (deliverables || []).filter(d => d.status === 'pending').length
        },
        metrics: {
          total_time_ms: project.total_time_ms,
          estimated_cost: project.estimated_cost
        },
        created_at: project.created_at,
        completed_at: project.completed_at
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
