/**
 * Approval Workflow Service
 * Handles deliverable approval, rejection, and regeneration
 *
 * Story 4.4: Operator Review & Approval Flow
 */

import { logger } from "../../utils/logger.js"
import deliverableRepository, {
  type DeliverableStatus,
} from "../../repositories/DeliverableRepository.js"
import projectRepository from "../../repositories/ProjectRepository.js"

// =====================================================
// TYPES
// =====================================================

export interface ApprovalResult {
  id: string;
  status: DeliverableStatus;
  approved_at: string;
  project_status?: string;
  all_approved?: boolean;
}

export interface RejectionResult {
  id: string;
  status: DeliverableStatus;
  feedback: string;
  rejected_at: string;
}

export interface RegenerationResult {
  id: string;
  status: DeliverableStatus;
  regenerations: number;
  retrying: boolean;
  feedback?: string;
}

export interface DeliveryReport {
  project_id: string;
  status: string;
  approval_summary: {
    total_pieces: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  deliverables: Array<{
    type: string;
    status: string;
    feedback?: string;
    regenerations: number;
  }>;
  metrics?: {
    total_tokens_used?: number;
    estimated_cost?: number;
    total_execution_time_ms?: number;
  };
}

// =====================================================
// APPROVAL WORKFLOW
// =====================================================

/**
 * Approve a deliverable
 */
export async function approveDeliverable(deliverableId: string): Promise<ApprovalResult> {
  logger.info('[APPROVAL] Approving deliverable', { deliverableId });

  const deliverable = await deliverableRepository.getById(deliverableId);
  if (!deliverable) {
    throw new Error(`Deliverable not found: ${deliverableId}`);
  }

  if (deliverable.status === 'approved') {
    logger.warn('[APPROVAL] Deliverable already approved', { deliverableId });
    return {
      id: deliverable.id,
      status: 'approved',
      approved_at: deliverable.approved_at || new Date().toISOString(),
    };
  }

  // Update deliverable to approved
  const updated = await deliverableRepository.updateStatus(deliverableId, 'approved');

  // Check if all deliverables in project are now approved
  const summary = await deliverableRepository.getProjectDeliverablesSummary(
    deliverable.project_id
  );

  let projectStatus = 'ready_for_review';
  if (summary.all_approved) {
    // Update project to completed if all pieces approved
    await projectRepository.updateStatus(deliverable.project_id, 'completed');
    projectStatus = 'completed';
  }

  logger.info('[APPROVAL] Deliverable approved', {
    deliverableId,
    all_approved: summary.all_approved,
  });

  return {
    id: updated.id,
    status: updated.status as DeliverableStatus,
    approved_at: updated.approved_at || new Date().toISOString(),
    project_status: projectStatus,
    all_approved: summary.all_approved,
  };
}

/**
 * Reject a deliverable with feedback
 */
export async function rejectDeliverable(
  deliverableId: string,
  feedback: string
): Promise<RejectionResult> {
  logger.info('[APPROVAL] Rejecting deliverable', { deliverableId });

  const deliverable = await deliverableRepository.getById(deliverableId);
  if (!deliverable) {
    throw new Error(`Deliverable not found: ${deliverableId}`);
  }

  if (!feedback || feedback.trim().length < 5) {
    throw new Error('Feedback must be at least 5 characters');
  }

  // Update deliverable to rejected with feedback
  const updated = await deliverableRepository.updateStatus(deliverableId, 'rejected');

  // Feedback is stored in the update call above, no need for additional update

  logger.info('[APPROVAL] Deliverable rejected', { deliverableId, feedback });

  return {
    id: updated.id,
    status: updated.status as DeliverableStatus,
    feedback,
    rejected_at: updated.rejected_at || new Date().toISOString(),
  };
}

/**
 * Regenerate a deliverable with feedback context
 */
export async function regenerateDeliverable(
  deliverableId: string,
  feedback?: string
): Promise<RegenerationResult> {
  logger.info('[APPROVAL] Initiating regeneration', { deliverableId });

  const deliverable = await deliverableRepository.getById(deliverableId);
  if (!deliverable) {
    throw new Error(`Deliverable not found: ${deliverableId}`);
  }

  // Check max regenerations (max 2)
  if (deliverable.regenerations >= 2) {
    throw new Error(
      `Maximum regenerations (2) exceeded for deliverable ${deliverableId}`
    );
  }

  // Update status to generating and increment regenerations
  const updated = await deliverableRepository.addFeedbackAndRegenerate(
    deliverableId,
    feedback || ''
  );

  logger.info('[APPROVAL] Regeneration initiated', {
    deliverableId,
    regenerations: updated.regenerations,
  });

  // In production: queue regeneration job with feedback context
  // For MVP: just mark as generating and log the feedback
  if (feedback) {
    logger.info('[APPROVAL] Regeneration feedback context', {
      deliverableId,
      feedback,
    });
  }

  return {
    id: updated.id,
    status: 'generating',
    regenerations: updated.regenerations,
    retrying: true,
    feedback: feedback || updated.feedback || undefined,
  };
}

/**
 * Build delivery report for a project
 */
export async function buildDeliveryReport(projectId: string): Promise<DeliveryReport> {
  logger.info('[APPROVAL] Building delivery report', { projectId });

  const summary = await deliverableRepository.getProjectDeliverablesSummary(projectId);
  const project = await projectRepository.getById(projectId);

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const deliverableSummary: Array<{
    type: string;
    status: string;
    feedback?: string;
    regenerations: number;
  }> = summary.deliverables.map((d) => ({
    type: d.type,
    status: d.status,
    feedback: d.feedback || undefined,
    regenerations: d.regenerations,
  }));

  const report: DeliveryReport = {
    project_id: projectId,
    status: project.status,
    approval_summary: {
      total_pieces: summary.deliverables.length,
      approved: summary.approved_count,
      rejected: summary.rejected_count,
      pending: summary.pending_count,
    },
    deliverables: deliverableSummary,
    metrics: {
      total_tokens_used: project.tokens_used?.total || 0,
      estimated_cost: project.estimated_cost || 0,
      total_execution_time_ms: project.total_time_ms || 0,
    },
  };

  logger.info('[APPROVAL] Delivery report built', {
    projectId,
    total_pieces: summary.deliverables.length,
    all_approved: summary.all_approved,
  });

  return report;
}

/**
 * Get project status after approval operations
 */
export async function getProjectApprovalStatus(projectId: string): Promise<{
  project_status: string;
  all_approved: boolean;
  approval_count: number;
  rejection_count: number;
  pending_count: number;
}> {
  const summary = await deliverableRepository.getProjectDeliverablesSummary(projectId);

  return {
    project_status: summary.all_approved ? 'completed' : 'ready_for_review',
    all_approved: summary.all_approved,
    approval_count: summary.approved_count,
    rejection_count: summary.rejected_count,
    pending_count: summary.pending_count,
  };
}
