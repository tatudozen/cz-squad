/**
 * Project Repository
 * Handles all Supabase operations for project pipeline orchestration
 *
 * Story 4.3: End-to-End Pipeline Orchestration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from "../utils/logger.js"

export type ProjectStatus = 'pending' | 'generating' | 'ready_for_review' | 'approved' | 'completed' | 'delivered' | 'failed';
export type PipelineStatus = 'pending' | 'generating' | 'ready_for_review' | 'approved' | 'failed' | 'skipped';

export interface ProjectRecord {
  id: string;
  client_id: string;
  briefing_id: string;
  brand_profile_id: string;
  status: ProjectStatus;
  content_package_id: string | null;
  funwheel_id: string | null;
  sales_page_id: string | null;
  content_status: PipelineStatus;
  funwheel_status: PipelineStatus;
  sales_page_status: PipelineStatus;
  tokens_used: Record<string, number>;
  estimated_cost: number | null;
  total_time_ms: number | null;
  operator_phone: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  error_log: Array<{ pipeline: string; error: string; timestamp: string }>;
}

export interface CreateProjectInput {
  client_id: string;
  briefing_id: string;
  brand_profile_id: string;
  operator_phone?: string;
  content_status?: PipelineStatus;
  funwheel_status?: PipelineStatus;
  sales_page_status?: PipelineStatus;
}

export class ProjectRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async create(input: CreateProjectInput): Promise<ProjectRecord> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        client_id: input.client_id,
        briefing_id: input.briefing_id,
        brand_profile_id: input.brand_profile_id,
        operator_phone: input.operator_phone || null,
        content_status: input.content_status || 'pending',
        funwheel_status: input.funwheel_status || 'pending',
        sales_page_status: input.sales_page_status || 'pending',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create project', { error: error.message });
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data as ProjectRecord;
  }

  async getById(id: string): Promise<ProjectRecord | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get project', { error: error.message, id });
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return (data as ProjectRecord) || null;
  }

  async getByClientId(clientId: string): Promise<ProjectRecord[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get projects by client', { error: error.message, clientId });
      throw new Error(`Failed to get projects: ${error.message}`);
    }

    return (data as ProjectRecord[]) || [];
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<ProjectRecord> {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'generating') {
      updates.started_at = new Date().toISOString();
    }
    if (status === 'ready_for_review' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update project status', { error: error.message, id, status });
      throw new Error(`Failed to update project status: ${error.message}`);
    }

    return data as ProjectRecord;
  }

  async updatePipelineStatus(
    id: string,
    pipeline: 'content' | 'funwheel' | 'sales_page',
    status: PipelineStatus,
    pipelineId?: string
  ): Promise<ProjectRecord> {
    const updates: Record<string, unknown> = {
      [`${pipeline}_status`]: status,
      updated_at: new Date().toISOString(),
    };

    if (pipelineId) {
      const idField = pipeline === 'content' ? 'content_package_id'
        : pipeline === 'funwheel' ? 'funwheel_id'
        : 'sales_page_id';
      updates[idField] = pipelineId;
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update pipeline status', { error: error.message, id, pipeline, status });
      throw new Error(`Failed to update pipeline status: ${error.message}`);
    }

    return data as ProjectRecord;
  }

  async addErrorLog(
    id: string,
    pipeline: string,
    errorMessage: string
  ): Promise<void> {
    const project = await this.getById(id);
    if (!project) return;

    const errorLog = [...(project.error_log || []), {
      pipeline,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }];

    const { error } = await this.supabase
      .from('projects')
      .update({
        error_log: errorLog,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to add error log', { error: error.message, id });
    }
  }

  async updateMetrics(
    id: string,
    metrics: {
      tokens_used?: Record<string, number>;
      estimated_cost?: number;
      total_time_ms?: number;
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({
        ...metrics,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update metrics', { error: error.message, id });
    }
  }
}

// Singleton instance
const projectRepository = new ProjectRepository(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default projectRepository;
