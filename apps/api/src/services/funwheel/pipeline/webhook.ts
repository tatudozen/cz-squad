/**
 * Webhook Service
 * Handles webhook delivery with retry logic and HMAC signing
 */

import crypto from 'crypto';
import type { WebhookPayload, WebhookRetryConfig } from '../../../types/webhook.js';

const DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 4,
  timeoutMs: 30000,
};

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateSignature(payload: WebhookPayload, apiKey: string): string {
  const payloadString = JSON.stringify(payload);
  return crypto.createHmac('sha256', apiKey).update(payloadString).digest('hex');
}

/**
 * Validate webhook signature
 */
export function validateSignature(
  payload: WebhookPayload,
  signature: string,
  apiKey: string
): boolean {
  const expectedSignature = generateSignature(payload, apiKey);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Send webhook with exponential backoff retry logic
 */
export async function sendWebhookWithRetry(
  url: string,
  payload: WebhookPayload,
  apiKey: string,
  retryConfig: WebhookRetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{
  success: boolean;
  response?: string;
  attempts: number;
  lastError?: string;
}> {
  const signature = generateSignature(payload, apiKey);
  let lastError: string | undefined;
  let attempts = 0;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      // Calculate delay for exponential backoff
      if (attempt > 0) {
        const delayMs =
          retryConfig.initialDelayMs *
          Math.pow(retryConfig.backoffMultiplier, attempt - 1);
        await sleep(delayMs);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': new Date().toISOString(),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(retryConfig.timeoutMs),
      });

      if (response.ok) {
        const responseData = await response.text();
        return {
          success: true,
          response: responseData,
          attempts,
        };
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`;

      // Don't retry on client errors (4xx) except timeout
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          attempts,
          lastError,
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';

      // If this is the last attempt, return failure
      if (attempt === retryConfig.maxRetries) {
        return {
          success: false,
          attempts,
          lastError,
        };
      }

      // Otherwise continue to next retry
    }
  }

  return {
    success: false,
    attempts,
    lastError,
  };
}

/**
 * Send webhook (fire-and-forget pattern)
 */
export async function sendWebhookAsync(
  url: string,
  payload: WebhookPayload,
  apiKey: string
): Promise<void> {
  // Fire and forget - don't await
  sendWebhookWithRetry(url, payload, apiKey).catch((error) => {
    console.error(`Webhook delivery failed to ${url}:`, error);
    // TODO: Add to dead-letter queue for manual retry
  });
}

/**
 * Helper: sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test webhook endpoint
 */
export async function testWebhook(
  url: string,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  const testPayload: WebhookPayload = {
    event_type: 'lead_created',
    lead_id: 'test_lead_' + Date.now(),
    lead_name: 'Test Lead',
    email: 'test@example.com',
    phone: '(11) 99999-9999',
    qualification_tier: 'warm',
    qualification_score: 50,
    campaign_id: 'test_campaign',
    timestamp: new Date().toISOString(),
  };

  const result = await sendWebhookWithRetry(url, testPayload, apiKey, {
    maxRetries: 1, // Less retries for test
    initialDelayMs: 500,
    backoffMultiplier: 2,
    timeoutMs: 5000,
  });

  return {
    success: result.success,
    message: result.success
      ? 'Webhook endpoint is working correctly'
      : `Webhook delivery failed: ${result.lastError}`,
  };
}
