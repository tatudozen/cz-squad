/**
 * Tests for Pipeline Orchestrator
 * Story 4.3: End-to-End Pipeline Orchestration
 */

import { describe, it, expect } from 'vitest';
import {
  orchestrateProject,
  executeContentPipeline,
  executeFunWheelPipeline,
  executeSalesPagePipeline,
  retryPipeline,
  buildProjectStatus,
} from '../orchestrator.js';
import type { ProjectRecord } from '../../../repositories/ProjectRepository.js';

// =====================================================
// PIPELINE EXECUTOR TESTS
// =====================================================

describe('Pipeline Executors', () => {
  describe('executeContentPipeline()', () => {
    it('should return ready_for_review on success', async () => {
      const result = await executeContentPipeline('briefing-1', 'brand-1', 'client-1');

      expect(result.pipeline).toBe('content');
      expect(result.status).toBe('ready_for_review');
      expect(result.id).toBeTruthy();
      expect(result.id).toContain('content_');
      expect(result.time_ms).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('should include timing metrics', async () => {
      const result = await executeContentPipeline('briefing-1', 'brand-1', 'client-1');

      expect(result.time_ms).toBeGreaterThanOrEqual(0);
      expect(result.time_ms).toBeLessThan(5000);
    });
  });

  describe('executeFunWheelPipeline()', () => {
    it('should return ready_for_review on success', async () => {
      const result = await executeFunWheelPipeline('briefing-1', 'brand-1', 'client-1');

      expect(result.pipeline).toBe('funwheel');
      expect(result.status).toBe('ready_for_review');
      expect(result.id).toContain('funwheel_');
      expect(result.time_ms).toBeGreaterThan(0);
    });
  });

  describe('executeSalesPagePipeline()', () => {
    it('should return ready_for_review on success', async () => {
      const result = await executeSalesPagePipeline('briefing-1', 'brand-1', 'client-1');

      expect(result.pipeline).toBe('sales_page');
      expect(result.status).toBe('ready_for_review');
      expect(result.id).toContain('salespage_');
      expect(result.time_ms).toBeGreaterThan(0);
    });
  });
});

// =====================================================
// ORCHESTRATOR TESTS
// =====================================================

describe('orchestrateProject()', () => {
  it('should execute all 3 pipelines and return ready_for_review', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.project_id).toBe('project-123');
    expect(result.status).toBe('ready_for_review');
    expect(result.pipelines.content.status).toBe('ready_for_review');
    expect(result.pipelines.funwheel.status).toBe('ready_for_review');
    expect(result.pipelines.sales_page.status).toBe('ready_for_review');
  });

  it('should return pipeline IDs for all completed pipelines', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.pipelines.content.id).toContain('content_');
    expect(result.pipelines.funwheel.id).toContain('funwheel_');
    expect(result.pipelines.sales_page.id).toContain('salespage_');
  });

  it('should skip disabled pipelines', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: false, sales_page: false },
    });

    expect(result.pipelines.content.status).toBe('ready_for_review');
    expect(result.pipelines.funwheel.status).toBe('skipped');
    expect(result.pipelines.sales_page.status).toBe('skipped');
  });

  it('should execute only content pipeline when others are disabled', async () => {
    const result = await orchestrateProject({
      project_id: 'project-456',
      briefing_id: 'briefing-2',
      brand_profile_id: 'brand-2',
      client_id: 'client-2',
      pipelines: { content: true, funwheel: false, sales_page: false },
    });

    expect(result.status).toBe('ready_for_review');
    expect(result.pipelines.content.id).toBeTruthy();
    expect(result.pipelines.funwheel.id).toBeUndefined();
    expect(result.pipelines.sales_page.id).toBeUndefined();
  });

  it('should calculate metrics', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.metrics.total_time_ms).toBeGreaterThan(0);
    expect(result.metrics.tokens_used.content).toBe(8500);
    expect(result.metrics.tokens_used.funwheel).toBe(6000);
    expect(result.metrics.tokens_used.sales_page).toBe(12000);
    expect(result.metrics.tokens_used.total).toBe(26500);
    expect(result.metrics.estimated_cost).toBeGreaterThan(0);
  });

  it('should estimate cost correctly', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    // Cost should be positive and reasonable (< $10 for estimation)
    expect(result.metrics.estimated_cost).toBeGreaterThan(0);
    expect(result.metrics.estimated_cost).toBeLessThan(10);
  });

  it('should not send notification without operator phone', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.notification_sent).toBe(false);
  });

  it('should send notification with valid operator phone', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      operator_phone: '(11) 99999-9999',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.notification_sent).toBe(true);
  });

  it('should not send notification with short phone number', async () => {
    const result = await orchestrateProject({
      project_id: 'project-123',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      operator_phone: '123',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result.notification_sent).toBe(false);
  });

  it('should handle only sales_page pipeline', async () => {
    const result = await orchestrateProject({
      project_id: 'project-sp',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: false, funwheel: false, sales_page: true },
    });

    expect(result.status).toBe('ready_for_review');
    expect(result.pipelines.content.status).toBe('skipped');
    expect(result.pipelines.funwheel.status).toBe('skipped');
    expect(result.pipelines.sales_page.status).toBe('ready_for_review');
  });

  it('should calculate tokens only for enabled pipelines', async () => {
    const result = await orchestrateProject({
      project_id: 'project-partial',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: false, sales_page: false },
    });

    expect(result.metrics.tokens_used.content).toBe(8500);
    expect(result.metrics.tokens_used.funwheel).toBeUndefined();
    expect(result.metrics.tokens_used.sales_page).toBeUndefined();
    expect(result.metrics.tokens_used.total).toBe(8500);
  });

  it('should generate unique pipeline IDs', async () => {
    const result1 = await orchestrateProject({
      project_id: 'project-a',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    const result2 = await orchestrateProject({
      project_id: 'project-b',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result1.pipelines.content.id).not.toBe(result2.pipelines.content.id);
  });
});

// =====================================================
// RETRY PIPELINE TESTS
// =====================================================

describe('retryPipeline()', () => {
  it('should retry content pipeline', async () => {
    const result = await retryPipeline(
      'project-123', 'content', 'briefing-1', 'brand-1', 'client-1'
    );

    expect(result.pipeline).toBe('content');
    expect(result.status).toBe('ready_for_review');
    expect(result.id).toContain('content_');
  });

  it('should retry funwheel pipeline', async () => {
    const result = await retryPipeline(
      'project-123', 'funwheel', 'briefing-1', 'brand-1', 'client-1'
    );

    expect(result.pipeline).toBe('funwheel');
    expect(result.status).toBe('ready_for_review');
  });

  it('should retry sales_page pipeline', async () => {
    const result = await retryPipeline(
      'project-123', 'sales_page', 'briefing-1', 'brand-1', 'client-1'
    );

    expect(result.pipeline).toBe('sales_page');
    expect(result.status).toBe('ready_for_review');
  });
});

// =====================================================
// BUILD PROJECT STATUS TESTS
// =====================================================

describe('buildProjectStatus()', () => {
  const mockProject: ProjectRecord = {
    id: 'project-123',
    client_id: 'client-1',
    briefing_id: 'briefing-1',
    brand_profile_id: 'brand-1',
    status: 'ready_for_review',
    content_package_id: 'content-abc',
    funwheel_id: 'funwheel-def',
    sales_page_id: 'salespage-ghi',
    content_status: 'ready_for_review',
    funwheel_status: 'ready_for_review',
    sales_page_status: 'ready_for_review',
    tokens_used: { content: 8500, funwheel: 6000, sales_page: 12000, total: 26500 },
    estimated_cost: 1.03,
    total_time_ms: 5500,
    operator_phone: '(11) 99999-9999',
    started_at: '2026-02-26T10:00:00Z',
    completed_at: '2026-02-26T10:05:30Z',
    created_at: '2026-02-26T10:00:00Z',
    updated_at: '2026-02-26T10:05:30Z',
    error_log: [],
  };

  it('should build status response with all fields', () => {
    const status = buildProjectStatus(mockProject);

    expect(status.id).toBe('project-123');
    expect(status.status).toBe('ready_for_review');
    expect(status.pipelines.content.status).toBe('ready_for_review');
    expect(status.pipelines.content.id).toBe('content-abc');
    expect(status.pipelines.funwheel.status).toBe('ready_for_review');
    expect(status.pipelines.funwheel.id).toBe('funwheel-def');
    expect(status.pipelines.sales_page.status).toBe('ready_for_review');
    expect(status.pipelines.sales_page.id).toBe('salespage-ghi');
  });

  it('should include metrics', () => {
    const status = buildProjectStatus(mockProject);

    expect(status.metrics.total_time_ms).toBe(5500);
    expect(status.metrics.tokens_used?.total).toBe(26500);
    expect(status.metrics.estimated_cost).toBe(1.03);
  });

  it('should include timestamps', () => {
    const status = buildProjectStatus(mockProject);

    expect(status.created_at).toBe('2026-02-26T10:00:00Z');
    expect(status.completed_at).toBe('2026-02-26T10:05:30Z');
  });

  it('should handle project without completion time', () => {
    const inProgressProject = {
      ...mockProject,
      status: 'generating' as const,
      completed_at: null,
      total_time_ms: null,
    };

    const status = buildProjectStatus(inProgressProject);

    expect(status.status).toBe('generating');
    expect(status.completed_at).toBeUndefined();
    expect(status.metrics.total_time_ms).toBeUndefined();
  });

  it('should handle project with empty tokens', () => {
    const emptyTokens = {
      ...mockProject,
      tokens_used: {},
    };

    const status = buildProjectStatus(emptyTokens);

    expect(status.metrics.tokens_used).toBeUndefined();
  });

  it('should handle project with null pipeline IDs', () => {
    const noPipelineIds = {
      ...mockProject,
      content_package_id: null,
      funwheel_id: null,
      sales_page_id: null,
    };

    const status = buildProjectStatus(noPipelineIds);

    expect(status.pipelines.content.id).toBeUndefined();
    expect(status.pipelines.funwheel.id).toBeUndefined();
    expect(status.pipelines.sales_page.id).toBeUndefined();
  });

  it('should handle failed pipeline status', () => {
    const failedProject = {
      ...mockProject,
      status: 'failed' as const,
      content_status: 'failed' as const,
      funwheel_status: 'ready_for_review' as const,
      sales_page_status: 'failed' as const,
    };

    const status = buildProjectStatus(failedProject);

    expect(status.status).toBe('failed');
    expect(status.pipelines.content.status).toBe('failed');
    expect(status.pipelines.funwheel.status).toBe('ready_for_review');
    expect(status.pipelines.sales_page.status).toBe('failed');
  });

  it('should handle skipped pipeline status', () => {
    const skippedProject = {
      ...mockProject,
      funwheel_status: 'skipped' as const,
      funwheel_id: null,
    };

    const status = buildProjectStatus(skippedProject);

    expect(status.pipelines.funwheel.status).toBe('skipped');
    expect(status.pipelines.funwheel.id).toBeUndefined();
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle all pipelines disabled', async () => {
    const result = await orchestrateProject({
      project_id: 'project-empty',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: false, funwheel: false, sales_page: false },
    });

    // No pipelines to execute = instant completion
    expect(result.status).toBe('ready_for_review');
    expect(result.pipelines.content.status).toBe('skipped');
    expect(result.pipelines.funwheel.status).toBe('skipped');
    expect(result.pipelines.sales_page.status).toBe('skipped');
  });

  it('should complete within reasonable time', async () => {
    const startTime = Date.now();

    await orchestrateProject({
      project_id: 'project-timing',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    const elapsed = Date.now() - startTime;
    // Parallel execution: should be ~max(200, 150, 180) + overhead, not sum
    expect(elapsed).toBeLessThan(2000);
  });

  it('should return different project IDs for different inputs', async () => {
    const result1 = await orchestrateProject({
      project_id: 'project-unique-1',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    const result2 = await orchestrateProject({
      project_id: 'project-unique-2',
      briefing_id: 'briefing-1',
      brand_profile_id: 'brand-1',
      client_id: 'client-1',
      pipelines: { content: true, funwheel: true, sales_page: true },
    });

    expect(result1.project_id).not.toBe(result2.project_id);
  });
});
