/**
 * Webhook Integration Types
 * Handles CRM webhook configuration and payloads
 */

export interface WebhookConfig {
  id: string;
  client_id: string;
  webhook_url: string;
  webhook_events: string[]; // 'lead_qualified', 'lead_scored', etc.
  api_key: string; // For signing requests
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WebhookEventType = 'lead_qualified' | 'lead_scored' | 'lead_created';

export interface WebhookPayload {
  event_type: WebhookEventType;
  lead_id: string;
  lead_name: string;
  email: string;
  phone: string; // Brazilian format
  qualification_tier: 'hot' | 'warm' | 'cold';
  qualification_score: number;
  campaign_id: string;
  timestamp: string; // ISO8601
}

export interface WebhookRequest {
  url: string;
  payload: WebhookPayload;
  signature: string;
  maxRetries?: number;
  timeout?: number; // milliseconds
}

export interface WebhookResponse {
  success: boolean;
  response?: string;
  attempts: number;
  lastError?: string;
  timestamp: string;
}

export interface WebhookRetryConfig {
  maxRetries: number;
  initialDelayMs: number; // 1000ms default
  backoffMultiplier: number; // 4x exponential
  timeoutMs: number; // 30000ms default
}
