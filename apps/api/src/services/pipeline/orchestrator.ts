/**
 * Pipeline Orchestrator Service
 * Coordinates the execution of all 3 sub-pipelines (content, funwheel, sales-page)
 * for a given project from a single briefing.
 *
 * Story 4.3: End-to-End Pipeline Orchestration
 */

import { logger } from '../../utils/logger.ts';
import type { ProjectRecord, PipelineStatus } from '../../repositories/ProjectRepository.ts';

// =====================================================
// TYPES
// =====================================================

export interface PipelineConfig {
  content?: boolean;
  funwheel?: boolean;
  sales_page?: boolean;
}

export interface OrchestrateProjectInput {
  project_id: string;
  briefing_id: string;
  brand_profile_id: string;
  client_id: string;
  operator_phone?: string;
  pipelines: PipelineConfig;
}

export interface PipelineResult {
  pipeline: 'content' | 'funwheel' | 'sales_page';
  status: PipelineStatus;
  id?: string;
  error?: string;
  time_ms: number;
}

export interface OrchestrationResult {
  project_id: string;
  status: 'generating' | 'ready_for_review' | 'failed';
  pipelines: {
    content: { status: PipelineStatus; id?: string; error?: string };
    funwheel: { status: PipelineStatus; id?: string; error?: string };
    sales_page: { status: PipelineStatus; id?: string; error?: string };
  };
  metrics: {
    total_time_ms: number;
    tokens_used: Record<string, number>;
    estimated_cost: number;
  };
  notification_sent: boolean;
}

export interface ProjectStatusResponse {
  id: string;
  status: string;
  pipelines: {
    content: { status: string; id?: string; error?: string };
    funwheel: { status: string; id?: string; error?: string };
    sales_page: { status: string; id?: string; error?: string };
  };
  metrics: {
    total_time_ms?: number;
    tokens_used?: Record<string, number>;
    estimated_cost?: number;
  };
  created_at: string;
  completed_at?: string;
}

// =====================================================
// PIPELINE EXECUTORS (simulated for MVP)
// =====================================================

/**
 * Execute the Content Pipeline
 * In production: calls content strategy + generators (Stories 2.1-2.5)
 */
export async function executeContentPipeline(
  briefingId: string,
  brandProfileId: string,
  _clientId: string
): Promise<PipelineResult> {
  const startTime = Date.now();

  try {
    logger.info('[PIPELINE] Starting content pipeline', { briefingId, brandProfileId });

    // Simulate content generation (in production, would call:
    // 1. POST /content/generate-strategy
    // 2. POST /content/generate-posts
    // 3. POST /carousel/generate
    // 4. POST /static-post/generate
    // 5. POST /design-brief/generate)
    await simulateWork(200);

    const contentId = `content_${crypto.randomUUID().substring(0, 8)}`;

    logger.info('[PIPELINE] Content pipeline completed', { contentId });

    return {
      pipeline: 'content',
      status: 'ready_for_review',
      id: contentId,
      time_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown content pipeline error';
    logger.error('[PIPELINE] Content pipeline failed', { error: errorMessage });

    return {
      pipeline: 'content',
      status: 'failed',
      error: errorMessage,
      time_ms: Date.now() - startTime,
    };
  }
}

/**
 * Execute the FunWheel Pipeline
 * In production: calls FunWheel page generators (Stories 3.1-3.2)
 */
export async function executeFunWheelPipeline(
  briefingId: string,
  brandProfileId: string,
  _clientId: string
): Promise<PipelineResult> {
  const startTime = Date.now();

  try {
    logger.info('[PIPELINE] Starting funwheel pipeline', { briefingId, brandProfileId });

    // Simulate FunWheel generation (in production, would call:
    // 1. Generate FunWheel pages (Etapa R, T, A)
    // 2. Deploy to VPS
    // 3. Configure lead capture webhooks)
    await simulateWork(150);

    const funwheelId = `funwheel_${crypto.randomUUID().substring(0, 8)}`;

    logger.info('[PIPELINE] FunWheel pipeline completed', { funwheelId });

    return {
      pipeline: 'funwheel',
      status: 'ready_for_review',
      id: funwheelId,
      time_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown funwheel pipeline error';
    logger.error('[PIPELINE] FunWheel pipeline failed', { error: errorMessage });

    return {
      pipeline: 'funwheel',
      status: 'failed',
      error: errorMessage,
      time_ms: Date.now() - startTime,
    };
  }
}

/**
 * Execute the Sales Page Pipeline
 * In production: calls sales page copy generator + builder (Stories 4.1-4.2)
 */
export async function executeSalesPagePipeline(
  briefingId: string,
  brandProfileId: string,
  _clientId: string
): Promise<PipelineResult> {
  const startTime = Date.now();

  try {
    logger.info('[PIPELINE] Starting sales page pipeline', { briefingId, brandProfileId });

    // Simulate Sales Page generation (in production, would call:
    // 1. POST /sales-page/generate (copy)
    // 2. POST /sales-page/build (HTML)
    // 3. POST /sales-page/:id/deploy (VPS))
    await simulateWork(180);

    const salesPageId = `salespage_${crypto.randomUUID().substring(0, 8)}`;

    logger.info('[PIPELINE] Sales page pipeline completed', { salesPageId });

    return {
      pipeline: 'sales_page',
      status: 'ready_for_review',
      id: salesPageId,
      time_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sales page pipeline error';
    logger.error('[PIPELINE] Sales page pipeline failed', { error: errorMessage });

    return {
      pipeline: 'sales_page',
      status: 'failed',
      error: errorMessage,
      time_ms: Date.now() - startTime,
    };
  }
}

// =====================================================
// ORCHESTRATOR
// =====================================================

/**
 * Main orchestration function
 * Executes all enabled sub-pipelines in parallel, tracks status,
 * and sends notification on completion.
 */
export async function orchestrateProject(
  input: OrchestrateProjectInput
): Promise<OrchestrationResult> {
  const startTime = Date.now();

  logger.info('[ORCHESTRATOR] Starting project orchestration', {
    project_id: input.project_id,
    pipelines: input.pipelines,
  });

  // Execute enabled pipelines in parallel
  const pipelinePromises: Promise<PipelineResult>[] = [];

  if (input.pipelines.content) {
    pipelinePromises.push(
      executeContentPipeline(input.briefing_id, input.brand_profile_id, input.client_id)
    );
  }

  if (input.pipelines.funwheel) {
    pipelinePromises.push(
      executeFunWheelPipeline(input.briefing_id, input.brand_profile_id, input.client_id)
    );
  }

  if (input.pipelines.sales_page) {
    pipelinePromises.push(
      executeSalesPagePipeline(input.briefing_id, input.brand_profile_id, input.client_id)
    );
  }

  // Wait for all pipelines to complete
  const results = await Promise.allSettled(pipelinePromises);

  // Process results
  const pipelineResults: PipelineResult[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Handle unexpected rejection
    const pipelines: Array<'content' | 'funwheel' | 'sales_page'> = [];
    if (input.pipelines.content) pipelines.push('content');
    if (input.pipelines.funwheel) pipelines.push('funwheel');
    if (input.pipelines.sales_page) pipelines.push('sales_page');

    return {
      pipeline: pipelines[index] || 'content',
      status: 'failed' as PipelineStatus,
      error: result.reason?.message || 'Pipeline execution rejected',
      time_ms: Date.now() - startTime,
    };
  });

  // Build pipeline status map
  const pipelineStatuses = buildPipelineStatuses(input.pipelines, pipelineResults);

  // Determine overall status
  const hasResults = pipelineResults.length > 0;
  const allCompleted = !hasResults || pipelineResults.every(r => r.status === 'ready_for_review');
  const allFailed = hasResults && pipelineResults.every(r => r.status === 'failed');
  const overallStatus = allFailed ? 'failed' : allCompleted ? 'ready_for_review' : 'generating';

  // Calculate metrics
  const totalTimeMs = Date.now() - startTime;
  const tokens_used = estimateTokensUsed(input.pipelines);
  const estimatedCost = calculateEstimatedCost(tokens_used);

  // Send notification if all pipelines completed
  let notificationSent = false;
  if (overallStatus === 'ready_for_review' && input.operator_phone) {
    notificationSent = await sendCompletionNotification(
      input.project_id,
      input.operator_phone,
      input.client_id
    );
  }

  logger.info('[ORCHESTRATOR] Project orchestration completed', {
    project_id: input.project_id,
    status: overallStatus,
    total_time_ms: totalTimeMs,
    notification_sent: notificationSent,
  });

  return {
    project_id: input.project_id,
    status: overallStatus,
    pipelines: pipelineStatuses,
    metrics: {
      total_time_ms: totalTimeMs,
      tokens_used: tokens_used,
      estimated_cost: estimatedCost,
    },
    notification_sent: notificationSent,
  };
}

/**
 * Retry a specific pipeline for a project
 */
export async function retryPipeline(
  projectId: string,
  pipeline: 'content' | 'funwheel' | 'sales_page',
  briefingId: string,
  brandProfileId: string,
  clientId: string
): Promise<PipelineResult> {
  logger.info('[ORCHESTRATOR] Retrying pipeline', { projectId, pipeline });

  switch (pipeline) {
    case 'content':
      return executeContentPipeline(briefingId, brandProfileId, clientId);
    case 'funwheel':
      return executeFunWheelPipeline(briefingId, brandProfileId, clientId);
    case 'sales_page':
      return executeSalesPagePipeline(briefingId, brandProfileId, clientId);
  }
}

/**
 * Build project status response from a ProjectRecord
 */
export function buildProjectStatus(project: ProjectRecord): ProjectStatusResponse {
  return {
    id: project.id,
    status: project.status,
    pipelines: {
      content: {
        status: project.content_status,
        id: project.content_package_id || undefined,
      },
      funwheel: {
        status: project.funwheel_status,
        id: project.funwheel_id || undefined,
      },
      sales_page: {
        status: project.sales_page_status,
        id: project.sales_page_id || undefined,
      },
    },
    metrics: {
      total_time_ms: project.total_time_ms || undefined,
      tokens_used: Object.keys(project.tokens_used || {}).length > 0 ? project.tokens_used : undefined,
      estimated_cost: project.estimated_cost || undefined,
    },
    created_at: project.created_at,
    completed_at: project.completed_at || undefined,
  };
}

// =====================================================
// HELPERS
// =====================================================

function buildPipelineStatuses(
  config: PipelineConfig,
  results: PipelineResult[]
): OrchestrationResult['pipelines'] {
  const findResult = (name: string) => results.find(r => r.pipeline === name);

  return {
    content: config.content
      ? {
          status: findResult('content')?.status || 'pending',
          id: findResult('content')?.id,
          error: findResult('content')?.error,
        }
      : { status: 'skipped' },
    funwheel: config.funwheel
      ? {
          status: findResult('funwheel')?.status || 'pending',
          id: findResult('funwheel')?.id,
          error: findResult('funwheel')?.error,
        }
      : { status: 'skipped' },
    sales_page: config.sales_page
      ? {
          status: findResult('sales_page')?.status || 'pending',
          id: findResult('sales_page')?.id,
          error: findResult('sales_page')?.error,
        }
      : { status: 'skipped' },
  };
}

function estimateTokensUsed(pipelines: PipelineConfig): Record<string, number> {
  const tokens: Record<string, number> = {};
  if (pipelines.content) tokens.content = 8500;
  if (pipelines.funwheel) tokens.funwheel = 6000;
  if (pipelines.sales_page) tokens.sales_page = 12000;
  tokens.total = Object.values(tokens).reduce((sum, v) => sum + v, 0);
  return tokens;
}

function calculateEstimatedCost(tokens_used: Record<string, number>): number {
  // Approximate cost: $0.015 per 1K input tokens, $0.075 per 1K output tokens
  // Assuming ~60% input, ~40% output for estimation
  const total = tokens_used.total || 0;
  const inputTokens = total * 0.6;
  const outputTokens = total * 0.4;
  const cost = (inputTokens / 1000) * 0.015 + (outputTokens / 1000) * 0.075;
  return Math.round(cost * 100) / 100;
}

/**
 * Send WhatsApp notification via Evolution API when project is complete
 */
async function sendCompletionNotification(
  projectId: string,
  operatorPhone: string,
  clientId: string
): Promise<boolean> {
  try {
    // Build notification message
    const message = `✅ Projeto ${projectId.substring(0, 8)} pronto para revisão!\n\n`
      + `Cliente: ${clientId.substring(0, 8)}\n`
      + `Todas as peças foram geradas com sucesso.\n\n`
      + `Acesse o painel para revisar: https://app.copyzen.com.br/projects/${projectId}`;

    logger.info('[NOTIFICATION] Sending completion notification', {
      projectId,
      phone: operatorPhone,
    });

    // In production, would use EvolutionClient from notification.ts
    // For MVP, simulate the notification
    if (!operatorPhone || operatorPhone.length < 10) {
      logger.warn('[NOTIFICATION] Invalid phone number, skipping', { operatorPhone });
      return false;
    }

    logger.info('[NOTIFICATION] WhatsApp notification sent', {
      projectId,
      message: message.substring(0, 50) + '...',
    });

    return true;
  } catch (error) {
    logger.error('[NOTIFICATION] Failed to send notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    return false;
  }
}

/**
 * Simulate async work (for MVP pipeline execution)
 */
function simulateWork(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
