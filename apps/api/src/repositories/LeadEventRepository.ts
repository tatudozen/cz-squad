/**
 * Lead Event Repository
 * Handles lead event persistence and queries
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { LeadEvent, LeadEventType, LeadEventData } from '../types/funwheel.js';

export class LeadEventRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new lead event
   */
  async create(
    leadId: string,
    eventType: LeadEventType,
    eventData: LeadEventData
  ): Promise<LeadEvent> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .insert({
        lead_id: leadId,
        event_type: eventType,
        event_data: eventData,
        webhook_sent: false,
        retry_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead event: ${error.message}`);
    }

    return data as LeadEvent;
  }

  /**
   * Get event by ID
   */
  async findById(eventId: string): Promise<LeadEvent | null> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .select()
      .eq('id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch lead event: ${error.message}`);
    }

    return (data as LeadEvent) || null;
  }

  /**
   * Get all events for a lead
   */
  async findByLeadId(leadId: string): Promise<LeadEvent[]> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .select()
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch lead events: ${error.message}`);
    }

    return (data as LeadEvent[]) || [];
  }

  /**
   * Get events by type
   */
  async findByEventType(eventType: LeadEventType): Promise<LeadEvent[]> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .select()
      .eq('event_type', eventType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return (data as LeadEvent[]) || [];
  }

  /**
   * Get events that haven't been sent as webhooks yet
   */
  async findPendingWebhooks(): Promise<LeadEvent[]> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .select()
      .eq('webhook_sent', false)
      .lt('retry_count', 3)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch pending webhooks: ${error.message}`);
    }

    return (data as LeadEvent[]) || [];
  }

  /**
   * Mark event as webhook sent
   */
  async markWebhookSent(
    eventId: string,
    response: string
  ): Promise<LeadEvent> {
    const { data, error } = await this.supabase
      .from('lead_events')
      .update({
        webhook_sent: true,
        webhook_response: response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead event: ${error.message}`);
    }

    return data as LeadEvent;
  }

  /**
   * Increment retry count
   */
  async incrementRetry(eventId: string): Promise<LeadEvent> {
    const { data: current, error: fetchError } = await this.supabase
      .from('lead_events')
      .select('retry_count')
      .eq('id', eventId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch event: ${fetchError.message}`);
    }

    const newRetryCount = ((current as { retry_count: number })?.retry_count || 0) + 1;

    const { data, error } = await this.supabase
      .from('lead_events')
      .update({
        retry_count: newRetryCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update retry count: ${error.message}`);
    }

    return data as LeadEvent;
  }

  /**
   * Add webhook response for failed attempt
   */
  async recordWebhookAttempt(
    eventId: string,
    response: string,
    success: boolean
  ): Promise<LeadEvent> {
    if (success) {
      return this.markWebhookSent(eventId, response);
    }

    // On failure, increment retry and store response
    await this.incrementRetry(eventId);

    const { data, error } = await this.supabase
      .from('lead_events')
      .update({
        webhook_response: response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record webhook attempt: ${error.message}`);
    }

    return data as LeadEvent;
  }
}
