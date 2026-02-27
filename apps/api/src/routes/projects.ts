/**
 * Project Pipeline Routes
 * Endpoints for orchestrating the full generation pipeline
 *
 * Story 4.3: End-to-End Pipeline Orchestration
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrandProfileRepository, BriefingRepository } from '@shared/repositories/index.js';
import {
  orchestrateProject,
  retryPipeline,
  buildProjectStatus,
} from '../services/pipeline/orchestrator.js';
import projectRepository, { type PipelineStatus } from '../repositories/ProjectRepository.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const GenerateProjectSchema = z.object({
  briefing_id: z.string().uuid('Invalid briefing ID'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID'),
  client_id: z.string().uuid('Invalid client ID'),
  operator_phone: z.string().min(10).optional(),
  pipelines: z
    .object({
      content: z.boolean().default(true),
      funwheel: z.boolean().default(true),
      sales_page: z.boolean().default(true),
    })
    .optional(),
});

const RetryPipelineSchema = z.object({
  force: z.boolean().optional(),
});

// =====================================================
// ROUTES
// =====================================================

/**
 * POST /projects/generate
 * Start the full pipeline orchestration from a briefing
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GenerateProjectSchema.parse(req.body);

    // Validate briefing exists
    const briefing = await BriefingRepository.getById(validatedData.briefing_id);
    if (!briefing) {
      throw new ApiError(404, 'BRIEFING_NOT_FOUND', 'Briefing not found');
    }

    // Validate brand profile exists
    const brandProfile = await BrandProfileRepository.getById(validatedData.brand_profile_id);
    if (!brandProfile) {
      throw new ApiError(404, 'BRAND_PROFILE_NOT_FOUND', 'Brand profile not found');
    }

    // Pipeline configuration (default: all enabled)
    const pipelineConfig = validatedData.pipelines || {
      content: true,
      funwheel: true,
      sales_page: true,
    };

    // Create project record
    const project = await projectRepository.create({
      client_id: validatedData.client_id,
      briefing_id: validatedData.briefing_id,
      brand_profile_id: validatedData.brand_profile_id,
      operator_phone: validatedData.operator_phone,
      content_status: pipelineConfig.content ? 'pending' : 'skipped',
      funwheel_status: pipelineConfig.funwheel ? 'pending' : 'skipped',
      sales_page_status: pipelineConfig.sales_page ? 'pending' : 'skipped',
    });

    // Update status to generating
    await projectRepository.updateStatus(project.id, 'generating');

    // Start orchestration (fire-and-forget for async execution)
    const orchestrationPromise = orchestrateProject({
      project_id: project.id,
      briefing_id: validatedData.briefing_id,
      brand_profile_id: validatedData.brand_profile_id,
      client_id: validatedData.client_id,
      operator_phone: validatedData.operator_phone,
      pipelines: pipelineConfig,
    });

    // Handle orchestration completion in background
    orchestrationPromise
      .then(async (result) => {
        // Update project with results
        await projectRepository.updateStatus(project.id, result.status);

        // Update individual pipeline statuses
        for (const [pipeline, pipelineResult] of Object.entries(result.pipelines)) {
          const pipelineName = pipeline as 'content' | 'funwheel' | 'sales_page';
          await projectRepository.updatePipelineStatus(
            project.id,
            pipelineName,
            pipelineResult.status as PipelineStatus,
            pipelineResult.id
          );

          if (pipelineResult.error) {
            await projectRepository.addErrorLog(project.id, pipeline, pipelineResult.error);
          }
        }

        // Update metrics
        await projectRepository.updateMetrics(project.id, {
          tokens_used: result.metrics.tokens_used,
          estimated_cost: result.metrics.estimated_cost,
          total_time_ms: result.metrics.total_time_ms,
        });

        // eslint-disable-next-line no-console
        console.log(
          `[PROJECT_COMPLETE] id=${project.id} status=${result.status} time=${result.metrics.total_time_ms}ms`
        );
      })
      .catch(async (error) => {
        // eslint-disable-next-line no-console
        console.error(`[PROJECT_ERROR] id=${project.id} error=${error.message}`);
        await projectRepository.updateStatus(project.id, 'failed');
        await projectRepository.addErrorLog(project.id, 'orchestrator', error.message);
      });

    // eslint-disable-next-line no-console
    console.log(
      `[PROJECT_CREATED] id=${project.id} briefing_id=${validatedData.briefing_id}`
    );

    // Return immediately with project ID (async execution)
    res.status(202).json({
      data: {
        id: project.id,
        status: 'generating',
        pipelines: {
          content: { status: pipelineConfig.content ? 'pending' : 'skipped' },
          funwheel: { status: pipelineConfig.funwheel ? 'pending' : 'skipped' },
          sales_page: { status: pipelineConfig.sales_page ? 'pending' : 'skipped' },
        },
        created_at: project.created_at,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:id/status
 * Get the current status of a project and its pipelines
 */
router.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;

    if (!projectId || projectId.length < 8) {
      throw new ApiError(400, 'INVALID_PROJECT_ID', 'Invalid project ID format');
    }

    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    const statusResponse = buildProjectStatus(project);

    res.status(200).json({
      data: statusResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /projects/:id/retry/:pipeline
 * Retry a specific failed pipeline
 */
router.post('/:id/retry/:pipeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const pipeline = req.params.pipeline as 'content' | 'funwheel' | 'sales_page';
    const validatedData = RetryPipelineSchema.parse(req.body);

    // Validate pipeline name
    if (!['content', 'funwheel', 'sales_page'].includes(pipeline)) {
      throw new ApiError(400, 'INVALID_PIPELINE', 'Pipeline must be content, funwheel, or sales_page');
    }

    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    // Check if pipeline is actually failed (unless force retry)
    const statusField = `${pipeline}_status` as keyof typeof project;
    if (!validatedData.force && project[statusField] !== 'failed') {
      throw new ApiError(
        400,
        'PIPELINE_NOT_FAILED',
        `Pipeline ${pipeline} is not in failed state (current: ${project[statusField]})`
      );
    }

    // Update pipeline status to generating
    await projectRepository.updatePipelineStatus(project.id, pipeline, 'generating');

    // Execute retry
    const result = await retryPipeline(
      project.id,
      pipeline,
      project.briefing_id,
      project.brand_profile_id,
      project.client_id
    );

    // Update pipeline status with result
    await projectRepository.updatePipelineStatus(
      project.id,
      pipeline,
      result.status,
      result.id
    );

    if (result.error) {
      await projectRepository.addErrorLog(project.id, pipeline, result.error);
    }

    // Check if all pipelines are now complete
    const updatedProject = await projectRepository.getById(project.id);
    if (updatedProject) {
      const statuses = [
        updatedProject.content_status,
        updatedProject.funwheel_status,
        updatedProject.sales_page_status,
      ];
      const allDone = statuses.every(
        (s) => s === 'ready_for_review' || s === 'approved' || s === 'skipped'
      );
      if (allDone) {
        await projectRepository.updateStatus(project.id, 'ready_for_review');
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[PIPELINE_RETRY] project=${projectId} pipeline=${pipeline} status=${result.status}`
    );

    res.status(200).json({
      data: {
        status: result.status,
        pipeline,
        id: result.id,
        retrying: result.status === 'generating',
        error: result.error,
        time_ms: result.time_ms,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
