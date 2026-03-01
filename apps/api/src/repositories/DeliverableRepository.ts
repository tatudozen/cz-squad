/**
 * Deliverable Repository
 * Data access layer for deliverables (approval workflow)
 *
 * Story 4.4: Operator Review & Approval Flow
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from "../utils/logger.js"
import { config } from "../utils/config.js"

// =====================================================
// TYPES
// =====================================================

export type DeliverableStatus = 'pending' | 'ready_for_review' | 'approved' | 'rejected' | 'generating';
export type DeliverableType = 'content' | 'funwheel' | 'sales_page';

export interface DeliverableRecord {
  id: string;
  project_id: string;
  type: DeliverableType;
  status: DeliverableStatus;
  preview: Record<string, unknown>;
  full_content?: Record<string, unknown>;
  approved_at?: string | null;
  rejected_at?: string | null;
  feedback?: string | null;
  regenerations: number;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);

export interface CreateDeliverableInput {
  project_id: string;
  type: DeliverableType;
  status?: DeliverableStatus;
  preview: Record<string, unknown>;
  full_content?: Record<string, unknown>;
}

export interface UpdateDeliverableInput {
  status?: DeliverableStatus;
  preview?: Record<string, unknown>;
  full_content?: Record<string, unknown>;
  feedback?: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

// =====================================================
// REPOSITORY
// =====================================================

class DeliverableRepository {
  /**
   * Create a new deliverable
   */
  async create(input: CreateDeliverableInput): Promise<DeliverableRecord> {
    const { data, error } = await supabase
      .from('deliverables')
      .insert({
        project_id: input.project_id,
        type: input.type,
        status: input.status || 'pending',
        preview: input.preview,
        full_content: input.full_content || {},
      })
      .select()
      .single();

    if (error) {
      logger.error('[DELIVERABLE_REPO] Failed to create deliverable', { error: error.message });
      throw new Error(`Failed to create deliverable: ${error.message}`);
    }

    return data as DeliverableRecord;
  }

  /**
   * Get deliverable by ID
   */
  async getById(id: string): Promise<DeliverableRecord | null> {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('[DELIVERABLE_REPO] Failed to fetch deliverable', { error: error.message });
      throw new Error(`Failed to fetch deliverable: ${error.message}`);
    }

    return (data as DeliverableRecord) || null;
  }

  /**
   * Get all deliverables for a project
   */
  async getByProjectId(projectId: string): Promise<DeliverableRecord[]> {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('[DELIVERABLE_REPO] Failed to fetch project deliverables', {
        error: error.message,
      });
      throw new Error(`Failed to fetch deliverables: ${error.message}`);
    }

    return (data as DeliverableRecord[]) || [];
  }

  /**
   * Update deliverable status
   */
  async updateStatus(id: string, status: DeliverableStatus): Promise<DeliverableRecord> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status };

    // Auto-set timestamps based on status
    if (status === 'approved') {
      updates.approved_at = now;
      updates.rejected_at = null;
    } else if (status === 'rejected') {
      updates.rejected_at = now;
    } else if (status === 'generating') {
      // Clear approval/rejection timestamps when regenerating
      updates.approved_at = null;
      updates.rejected_at = null;
    }

    const { data, error } = await supabase
      .from('deliverables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('[DELIVERABLE_REPO] Failed to update status', { error: error.message });
      throw new Error(`Failed to update deliverable status: ${error.message}`);
    }

    return data as DeliverableRecord;
  }

  /**
   * Update deliverable with feedback and increment regenerations
   */
  async addFeedbackAndRegenerate(
    id: string,
    feedback: string
  ): Promise<DeliverableRecord> {
    // First get current regenerations count
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Deliverable not found: ${id}`);
    }

    const { data, error } = await supabase
      .from('deliverables')
      .update({
        feedback,
        regenerations: current.regenerations + 1,
        status: 'generating',
        approved_at: undefined,
        rejected_at: undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('[DELIVERABLE_REPO] Failed to add feedback', { error: error.message });
      throw new Error(`Failed to add feedback: ${error.message}`);
    }

    return data as DeliverableRecord;
  }

  /**
   * Get regeneration count for a deliverable
   */
  async getRegenerationCount(id: string): Promise<number> {
    const deliverable = await this.getById(id);
    return deliverable?.regenerations || 0;
  }

  /**
   * Update full content (after regeneration)
   */
  async updateContent(
    id: string,
    content: Record<string, unknown>
  ): Promise<DeliverableRecord> {
    const { data, error } = await supabase
      .from('deliverables')
      .update({
        full_content: content,
        status: 'ready_for_review',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('[DELIVERABLE_REPO] Failed to update content', { error: error.message });
      throw new Error(`Failed to update content: ${error.message}`);
    }

    return data as DeliverableRecord;
  }

  /**
   * Get all deliverables for a project with aggregated status
   */
  async getProjectDeliverablesSummary(
    projectId: string
  ): Promise<{
    deliverables: DeliverableRecord[];
    approved_count: number;
    rejected_count: number;
    pending_count: number;
    all_approved: boolean;
  }> {
    const deliverables = await this.getByProjectId(projectId);

    const approved_count = deliverables.filter((d) => d.status === 'approved').length;
    const rejected_count = deliverables.filter((d) => d.status === 'rejected').length;
    const pending_count = deliverables.filter(
      (d) => d.status === 'pending' || d.status === 'ready_for_review' || d.status === 'generating'
    ).length;

    return {
      deliverables,
      approved_count,
      rejected_count,
      pending_count,
      all_approved: pending_count === 0 && rejected_count === 0 && approved_count > 0,
    };
  }

  /**
   * List all deliverables for a project grouped by type
   */
  async getByProjectIdGroupedByType(projectId: string): Promise<Map<DeliverableType, DeliverableRecord[]>> {
    const deliverables = await this.getByProjectId(projectId);
    const grouped = new Map<DeliverableType, DeliverableRecord[]>();

    for (const type of ['content', 'funwheel', 'sales_page'] as DeliverableType[]) {
      grouped.set(type, deliverables.filter((d) => d.type === type));
    }

    return grouped;
  }
}

export default new DeliverableRepository();
