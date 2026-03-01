/**
 * Content Plan Repository
 * Handles all Supabase operations for content plans
 *
 * Story 2.1: Content Strategy & Planning Module
 */

import { createClient } from '@supabase/supabase-js';
import { ContentPlan } from "../types/content.js"
import { logger } from "../utils/logger.js"

/**
 * ContentPlanRepository provides database operations for content plans
 */
export class ContentPlanRepository {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Save a content plan to Supabase
   * @param plan - The content plan to save
   * @returns The saved plan with Supabase metadata
   * @throws Error if save fails
   */
  async saveContentPlan(plan: ContentPlan): Promise<ContentPlan> {
    const { data, error } = await this.supabase
      .from('content_plans')
      .insert({
        id: plan.id,
        briefing_id: plan.briefing_id,
        brand_profile_id: plan.brand_profile_id,
        client_id: plan.client_id,
        plan_json: {
          ...plan,
          posts: plan.posts,
        },
        status: plan.status,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to save content plan', {
        error: error.message,
        plan_id: plan.id,
      });
      throw new Error(`Failed to save content plan: ${error.message}`);
    }

    logger.info('Content plan saved to Supabase', {
      plan_id: data.id,
      briefing_id: data.briefing_id,
    });

    return data as ContentPlan;
  }

  /**
   * Get a content plan by ID
   * @param planId - The plan ID
   * @returns The content plan or null if not found
   */
  async getContentPlanById(planId: string): Promise<ContentPlan | null> {
    const { data, error } = await this.supabase
      .from('content_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "No rows found"
      logger.error('Failed to retrieve content plan', {
        error: error.message,
        plan_id: planId,
      });
      throw new Error(`Failed to retrieve content plan: ${error.message}`);
    }

    return data as ContentPlan | null;
  }

  /**
   * Get content plans by briefing ID
   * @param briefingId - The briefing ID
   * @returns Array of content plans for the briefing
   */
  async getContentPlansByBriefing(briefingId: string): Promise<ContentPlan[]> {
    const { data, error } = await this.supabase
      .from('content_plans')
      .select('*')
      .eq('briefing_id', briefingId);

    if (error) {
      logger.error('Failed to retrieve content plans by briefing', {
        error: error.message,
        briefing_id: briefingId,
      });
      throw new Error(`Failed to retrieve content plans: ${error.message}`);
    }

    return (data as ContentPlan[]) || [];
  }

  /**
   * Update a content plan's status
   * @param planId - The plan ID
   * @param status - The new status
   * @returns The updated plan
   */
  async updateContentPlanStatus(
    planId: string,
    status: 'draft' | 'approved' | 'active'
  ): Promise<ContentPlan> {
    const { data, error } = await this.supabase
      .from('content_plans')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update content plan status', {
        error: error.message,
        plan_id: planId,
      });
      throw new Error(`Failed to update content plan: ${error.message}`);
    }

    return data as ContentPlan;
  }
}

// Create and export singleton instance
const contentPlanRepository = new ContentPlanRepository(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default contentPlanRepository;
