import { createClient } from '@supabase/supabase-js';
import { config } from '../../utils/config.js';
import type { Briefing, BrandProfile } from '@copyzen/shared/types/index.js';

export interface ProjectStatus {
  id: string;
  status: 'pending' | 'generating' | 'ready_for_review' | 'completed';
  content_status: string;
  funwheel_status: string;
  sales_page_status: string;
  progress_percent: number;
}

export interface OrchestrationResult {
  project_id: string;
  status: string;
  content_package_id?: string;
  funwheel_id?: string;
  sales_page_id?: string;
  total_time_ms: number;
}

export class ProjectOrchestrator {
  private supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

  async orchestrateFullPipeline(
    briefing: Briefing,
    brandProfile: BrandProfile,
    clientId: string
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const projectId = crypto.randomUUID();

    try {
      // 1. Create project record
      const { error: projectError } = await this.supabase
        .from('projects')
        .insert({
          id: projectId,
          client_id: clientId,
          briefing_id: briefing.id,
          brand_profile_id: brandProfile.id,
          status: 'pending',
          started_at: new Date().toISOString()
        });

      if (projectError) throw projectError;

      // 2. Update status to generating
      await this.supabase
        .from('projects')
        .update({ status: 'generating' })
        .eq('id', projectId);

      // 3. Dispatch all 3 sub-pipelines in parallel
      const [contentResult, funwheelResult, salesPageResult] = await Promise.allSettled([
        this.dispatchContentPipeline(briefing, brandProfile, projectId),
        this.dispatchFunwheelPipeline(briefing, brandProfile, projectId),
        this.dispatchSalesPagePipeline(briefing, brandProfile, projectId)
      ]);

      // Extract results
      const contentId = contentResult.status === 'fulfilled' ? contentResult.value : undefined;
      const funwheelId = funwheelResult.status === 'fulfilled' ? funwheelResult.value : undefined;
      const salesPageId = salesPageResult.status === 'fulfilled' ? salesPageResult.value : undefined;

      // 4. Update project with results
      const totalTime = Date.now() - startTime;
      await this.supabase
        .from('projects')
        .update({
          status: 'ready_for_review',
          content_package_id: contentId,
          funwheel_id: funwheelId,
          sales_page_id: salesPageId,
          content_status: contentResult.status === 'fulfilled' ? 'completed' : 'failed',
          funwheel_status: funwheelResult.status === 'fulfilled' ? 'completed' : 'failed',
          sales_page_status: salesPageResult.status === 'fulfilled' ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          total_time_ms: totalTime
        })
        .eq('id', projectId);

      // 5. Send WhatsApp notification
      await this.notifyWhatsApp(clientId, briefing.business_name);

      return {
        project_id: projectId,
        status: 'ready_for_review',
        content_package_id: contentId,
        funwheel_id: funwheelId,
        sales_page_id: salesPageId,
        total_time_ms: totalTime
      };
    } catch (error) {
      // Log error
      await this.supabase
        .from('projects')
        .update({
          status: 'failed',
          error_log: [{ timestamp: new Date().toISOString(), error: String(error) }]
        })
        .eq('id', projectId);

      throw error;
    }
  }

  private async dispatchContentPipeline(
    _briefing: Briefing,
    _brandProfile: BrandProfile,
    projectId: string
  ): Promise<string> {
    const contentId = crypto.randomUUID();
    
    await this.supabase
      .from('projects')
      .update({ content_status: 'generating' })
      .eq('id', projectId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.supabase
      .from('projects')
      .update({ content_status: 'completed' })
      .eq('id', projectId);

    return contentId;
  }

  private async dispatchFunwheelPipeline(
    _briefing: Briefing,
    _brandProfile: BrandProfile,
    projectId: string
  ): Promise<string> {
    const funwheelId = crypto.randomUUID();
    
    await this.supabase
      .from('projects')
      .update({ funwheel_status: 'generating' })
      .eq('id', projectId);

    await new Promise(resolve => setTimeout(resolve, 1500));

    await this.supabase
      .from('projects')
      .update({ funwheel_status: 'completed' })
      .eq('id', projectId);

    return funwheelId;
  }

  private async dispatchSalesPagePipeline(
    _briefing: Briefing,
    _brandProfile: BrandProfile,
    projectId: string
  ): Promise<string> {
    const salesPageId = crypto.randomUUID();
    
    await this.supabase
      .from('projects')
      .update({ sales_page_status: 'generating' })
      .eq('id', projectId);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await this.supabase
      .from('projects')
      .update({ sales_page_status: 'completed' })
      .eq('id', projectId);

    return salesPageId;
  }

  async getProjectStatus(projectId: string): Promise<ProjectStatus> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    const subPipelines = [
      data.content_status,
      data.funwheel_status,
      data.sales_page_status
    ];

    const completed = subPipelines.filter(s => s === 'completed').length;
    const progress = Math.round((completed / 3) * 100);

    return {
      id: projectId,
      status: data.status,
      content_status: data.content_status,
      funwheel_status: data.funwheel_status,
      sales_page_status: data.sales_page_status,
      progress_percent: progress
    };
  }

  private async notifyWhatsApp(_clientId: string, businessName: string): Promise<void> {
    // Placeholder for WhatsApp notification via Evolution API
    // eslint-disable-next-line no-console
    console.log(`[NOTIFICATION] WhatsApp: Projeto ${businessName} pronto para revisão`);
  }
}

export const projectOrchestrator = new ProjectOrchestrator();
