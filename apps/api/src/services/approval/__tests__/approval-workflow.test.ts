/**
 * Approval Workflow Tests
 * Story 4.4: Operator Review & Approval Flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  approveDeliverable,
  rejectDeliverable,
  regenerateDeliverable,
  buildDeliveryReport,
  getProjectApprovalStatus,
} from '../approval-workflow'
import deliverableRepository from '../../../repositories/DeliverableRepository'
import projectRepository from '../../../repositories/ProjectRepository'

// Mock dependencies
vi.mock('../../../repositories/DeliverableRepository.ts');
vi.mock('../../../repositories/ProjectRepository.ts');

// =====================================================
// TEST DATA
// =====================================================

const mockDeliverable = {
  id: 'deliv-001',
  project_id: 'proj-001',
  type: 'content' as const,
  status: 'ready_for_review' as const,
  preview: { title: 'Test Content' },
  approved_at: undefined,
  rejected_at: undefined,
  feedback: undefined,
  regenerations: 0,
  created_at: '2026-02-26T10:00:00Z',
  updated_at: '2026-02-26T10:00:00Z',
};

const mockProject = {
  id: 'proj-001',
  client_id: 'client-001',
  briefing_id: 'brief-001',
  brand_profile_id: 'brand-001',
  operator_phone: null,
  status: 'ready_for_review' as const,
  content_package_id: null,
  funwheel_id: null,
  sales_page_id: null,
  content_status: 'ready_for_review' as const,
  funwheel_status: 'ready_for_review' as const,
  sales_page_status: 'ready_for_review' as const,
  tokens_used: { content: 8500, total: 8500 },
  estimated_cost: 0.65,
  total_time_ms: 5000,
  started_at: null,
  completed_at: null,
  error_log: [],
  created_at: '2026-02-26T09:00:00Z',
  updated_at: '2026-02-26T10:00:00Z',
};

// =====================================================
// APPROVAL TESTS
// =====================================================

describe('approveDeliverable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve a deliverable successfully', async () => {
    const approvedDeliverable = {
      ...mockDeliverable,
      status: 'approved' as const,
      approved_at: '2026-02-26T10:05:00Z',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.updateStatus).mockResolvedValue(approvedDeliverable);
    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables: [approvedDeliverable],
      approved_count: 1,
      rejected_count: 0,
      pending_count: 0,
      all_approved: true,
    });
    vi.mocked(projectRepository.updateStatus).mockResolvedValue(mockProject);

    const result = await approveDeliverable('deliv-001');

    expect(result.status).toBe('approved');
    expect(result.approved_at).toBe('2026-02-26T10:05:00Z');
    expect(result.project_status).toBe('completed');
    expect(result.all_approved).toBe(true);
  });

  it('should handle already approved deliverable', async () => {
    const alreadyApproved = {
      ...mockDeliverable,
      status: 'approved' as const,
      approved_at: '2026-02-26T09:00:00Z',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(alreadyApproved);
    vi.mocked(deliverableRepository.updateStatus).mockResolvedValue(alreadyApproved);
    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables: [alreadyApproved],
      approved_count: 1,
      rejected_count: 0,
      pending_count: 0,
      all_approved: true,
    });

    const result = await approveDeliverable('deliv-001');

    expect(result.status).toBe('approved');
    expect(result.approved_at).toBeDefined();
  });

  it('should throw error if deliverable not found', async () => {
    vi.mocked(deliverableRepository.getById).mockResolvedValue(null);

    await expect(approveDeliverable('invalid-id')).rejects.toThrow('Deliverable not found');
  });

  it('should update project to completed when all pieces approved', async () => {
    const approvedDeliverable = {
      ...mockDeliverable,
      status: 'approved' as const,
      approved_at: '2026-02-26T10:05:00Z',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.updateStatus).mockResolvedValue(approvedDeliverable);
    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables: [approvedDeliverable],
      approved_count: 1,
      rejected_count: 0,
      pending_count: 0,
      all_approved: true,
    });
    vi.mocked(projectRepository.updateStatus).mockResolvedValue({
      ...mockProject,
      status: 'completed',
    });

    const result = await approveDeliverable('deliv-001');

    expect(result.project_status).toBe('completed');
    expect(projectRepository.updateStatus).toHaveBeenCalledWith('proj-001', 'completed');
  });
});

// =====================================================
// REJECTION TESTS
// =====================================================

describe('rejectDeliverable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject a deliverable with feedback', async () => {
    const rejectedDeliverable = {
      ...mockDeliverable,
      status: 'rejected' as const,
      rejected_at: '2026-02-26T10:05:00Z',
      feedback: 'Needs revision on colors',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.updateStatus).mockResolvedValue(rejectedDeliverable);

    const result = await rejectDeliverable('deliv-001', 'Needs revision on colors');

    expect(result.status).toBe('rejected');
    expect(result.feedback).toBe('Needs revision on colors');
    expect(result.rejected_at).toBeDefined();
  });

  it('should throw error if feedback is empty', async () => {
    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);

    await expect(rejectDeliverable('deliv-001', '')).rejects.toThrow('Feedback must be at least 5 characters');
  });

  it('should throw error if feedback is too short', async () => {
    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);

    await expect(rejectDeliverable('deliv-001', 'Bad')).rejects.toThrow('Feedback must be at least 5 characters');
  });

  it('should throw error if deliverable not found', async () => {
    vi.mocked(deliverableRepository.getById).mockResolvedValue(null);

    await expect(rejectDeliverable('invalid-id', 'Some feedback')).rejects.toThrow(
      'Deliverable not found'
    );
  });

  it('should preserve feedback in rejection', async () => {
    const feedback = 'Adjust headline and add social proof section';
    const rejectedDeliverable = {
      ...mockDeliverable,
      status: 'rejected' as const,
      feedback,
      rejected_at: '2026-02-26T10:05:00Z',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.updateStatus).mockResolvedValue(rejectedDeliverable);

    const result = await rejectDeliverable('deliv-001', feedback);

    expect(result.feedback).toBe(feedback);
  });
});

// =====================================================
// REGENERATION TESTS
// =====================================================

describe('regenerateDeliverable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should regenerate a deliverable', async () => {
    const regeneratingDeliverable = {
      ...mockDeliverable,
      status: 'generating' as const,
      regenerations: 1,
      feedback: 'User feedback for regeneration',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.addFeedbackAndRegenerate).mockResolvedValue(
      regeneratingDeliverable
    );

    const result = await regenerateDeliverable('deliv-001', 'User feedback for regeneration');

    expect(result.status).toBe('generating');
    expect(result.regenerations).toBe(1);
    expect(result.retrying).toBe(true);
    expect(result.feedback).toBeDefined();
  });

  it('should allow up to 2 regenerations', async () => {
    const firstRegen = { ...mockDeliverable, regenerations: 1 };
    const secondRegen = { ...mockDeliverable, regenerations: 2, status: 'generating' as const };

    vi.mocked(deliverableRepository.getById)
      .mockResolvedValueOnce(mockDeliverable)
      .mockResolvedValueOnce(firstRegen);
    vi.mocked(deliverableRepository.addFeedbackAndRegenerate)
      .mockResolvedValueOnce(firstRegen)
      .mockResolvedValueOnce(secondRegen);

    const result1 = await regenerateDeliverable('deliv-001');
    expect(result1.regenerations).toBe(1);

    const result2 = await regenerateDeliverable('deliv-001');
    expect(result2.regenerations).toBe(2);
  });

  it('should throw error when max regenerations exceeded', async () => {
    const maxedOut = { ...mockDeliverable, regenerations: 2 };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(maxedOut);

    await expect(regenerateDeliverable('deliv-001')).rejects.toThrow(
      'Maximum regenerations (2) exceeded'
    );
  });

  it('should handle regeneration with optional feedback', async () => {
    const regenerated = {
      ...mockDeliverable,
      status: 'generating' as const,
      regenerations: 1,
      feedback: '',
    };

    vi.mocked(deliverableRepository.getById).mockResolvedValue(mockDeliverable);
    vi.mocked(deliverableRepository.addFeedbackAndRegenerate).mockResolvedValue(regenerated);

    const result = await regenerateDeliverable('deliv-001');

    expect(result.status).toBe('generating');
    expect(result.regenerations).toBe(1);
  });

  it('should throw error if deliverable not found', async () => {
    vi.mocked(deliverableRepository.getById).mockResolvedValue(null);

    await expect(regenerateDeliverable('invalid-id')).rejects.toThrow('Deliverable not found');
  });
});

// =====================================================
// DELIVERY REPORT TESTS
// =====================================================

describe('buildDeliveryReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build a delivery report', async () => {
    const deliverables = [
      { ...mockDeliverable, type: 'content' as const, status: 'approved' as const },
      { ...mockDeliverable, type: 'funwheel' as const, status: 'approved' as const },
      { ...mockDeliverable, type: 'sales_page' as const, status: 'approved' as const },
    ];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 3,
      rejected_count: 0,
      pending_count: 0,
      all_approved: true,
    });
    vi.mocked(projectRepository.getById).mockResolvedValue(mockProject);

    const report = await buildDeliveryReport('proj-001');

    expect(report.project_id).toBe('proj-001');
    expect(report.approval_summary.total_pieces).toBe(3);
    expect(report.approval_summary.approved).toBe(3);
    expect(report.approval_summary.rejected).toBe(0);
    expect(report.approval_summary.pending).toBe(0);
  });

  it('should include metrics in report', async () => {
    const deliverables = [mockDeliverable];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 1,
      rejected_count: 0,
      pending_count: 0,
      all_approved: false,
    });
    vi.mocked(projectRepository.getById).mockResolvedValue(mockProject);

    const report = await buildDeliveryReport('proj-001');

    expect(report.metrics).toBeDefined();
    expect(report.metrics?.total_tokens_used).toBe(8500);
    expect(report.metrics?.estimated_cost).toBe(0.65);
    expect(report.metrics?.total_execution_time_ms).toBe(5000);
  });

  it('should throw error if project not found', async () => {
    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables: [],
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0,
      all_approved: false,
    });
    vi.mocked(projectRepository.getById).mockResolvedValue(null);

    await expect(buildDeliveryReport('invalid-proj')).rejects.toThrow('Project not found');
  });

  it('should include deliverable feedback in report', async () => {
    const deliverables = [
      {
        ...mockDeliverable,
        type: 'content' as const,
        status: 'rejected' as const,
        feedback: 'Needs revision',
      },
    ];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 0,
      rejected_count: 1,
      pending_count: 0,
      all_approved: false,
    });
    vi.mocked(projectRepository.getById).mockResolvedValue(mockProject);

    const report = await buildDeliveryReport('proj-001');

    expect(report.deliverables[0].feedback).toBe('Needs revision');
    expect(report.deliverables[0].status).toBe('rejected');
  });
});

// =====================================================
// APPROVAL STATUS TESTS
// =====================================================

describe('getProjectApprovalStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return completed status when all approved', async () => {
    const deliverables = [
      { ...mockDeliverable, status: 'approved' as const },
      { ...mockDeliverable, status: 'approved' as const },
    ];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 2,
      rejected_count: 0,
      pending_count: 0,
      all_approved: true,
    });

    const status = await getProjectApprovalStatus('proj-001');

    expect(status.project_status).toBe('completed');
    expect(status.all_approved).toBe(true);
  });

  it('should return ready_for_review when not all approved', async () => {
    const deliverables = [
      { ...mockDeliverable, status: 'approved' as const },
      { ...mockDeliverable, status: 'ready_for_review' as const },
    ];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 1,
      rejected_count: 0,
      pending_count: 1,
      all_approved: false,
    });

    const status = await getProjectApprovalStatus('proj-001');

    expect(status.project_status).toBe('ready_for_review');
    expect(status.all_approved).toBe(false);
  });

  it('should include approval counts', async () => {
    const deliverables = [
      { ...mockDeliverable, status: 'approved' as const },
      { ...mockDeliverable, status: 'rejected' as const },
      { ...mockDeliverable, status: 'ready_for_review' as const },
    ];

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary).mockResolvedValue({
      deliverables,
      approved_count: 1,
      rejected_count: 1,
      pending_count: 1,
      all_approved: false,
    });

    const status = await getProjectApprovalStatus('proj-001');

    expect(status.approval_count).toBe(1);
    expect(status.rejection_count).toBe(1);
    expect(status.pending_count).toBe(1);
  });
});

// =====================================================
// WORKFLOW INTEGRATION TESTS
// =====================================================

describe('Approval workflow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full approval → reject → regenerate → approve flow', async () => {
    const initial = mockDeliverable;
    const afterReject = { ...initial, status: 'rejected' as const, feedback: 'Needs work' };
    const afterRegenerate = {
      ...afterReject,
      status: 'generating' as const,
      regenerations: 1,
    };
    const regenerated = {
      ...afterRegenerate,
      status: 'ready_for_review' as const,
    };
    const final = { ...regenerated, status: 'approved' as const, approved_at: new Date().toISOString() };

    // Setup mocks for the flow
    vi.mocked(deliverableRepository.getById)
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(afterReject)
      .mockResolvedValueOnce(regenerated);

    vi.mocked(deliverableRepository.updateStatus)
      .mockResolvedValueOnce(afterReject)
      .mockResolvedValueOnce(final);

    vi.mocked(deliverableRepository.addFeedbackAndRegenerate).mockResolvedValueOnce(
      afterRegenerate
    );

    vi.mocked(deliverableRepository.getProjectDeliverablesSummary)
      .mockResolvedValueOnce({
        deliverables: [final],
        approved_count: 1,
        rejected_count: 0,
        pending_count: 0,
        all_approved: true,
      });

    vi.mocked(projectRepository.updateStatus).mockResolvedValue(mockProject);

    // Execute flow
    const reject = await rejectDeliverable('deliv-001', 'Needs work');
    expect(reject.status).toBe('rejected');

    const regen = await regenerateDeliverable('deliv-001', 'Fixed based on feedback');
    expect(regen.status).toBe('generating');

    const approve = await approveDeliverable('deliv-001');
    expect(approve.status).toBe('approved');
    expect(approve.project_status).toBe('completed');
  });

  it('should track regeneration count through the flow', async () => {
    const firstRegen = { ...mockDeliverable, regenerations: 1, status: 'generating' as const };
    const secondRegen = { ...mockDeliverable, regenerations: 2, status: 'generating' as const };

    vi.mocked(deliverableRepository.getById)
      .mockResolvedValueOnce(mockDeliverable)
      .mockResolvedValueOnce(firstRegen);

    vi.mocked(deliverableRepository.addFeedbackAndRegenerate)
      .mockResolvedValueOnce(firstRegen)
      .mockResolvedValueOnce(secondRegen);

    const result1 = await regenerateDeliverable('deliv-001');
    const result2 = await regenerateDeliverable('deliv-001');

    expect(result1.regenerations).toBe(1);
    expect(result2.regenerations).toBe(2);
  });
});
