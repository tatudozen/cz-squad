/**
 * Tests for Webhook Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateSignature,
  validateSignature,
  sendWebhookWithRetry,
  testWebhook,
} from '../webhook.js';
import type { WebhookPayload } from '../../../../types/webhook.js';

describe('Webhook Service', () => {
  const mockPayload: WebhookPayload = {
    event_type: 'lead_qualified',
    lead_id: 'lead_123',
    lead_name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    qualification_tier: 'hot',
    qualification_score: 85,
    campaign_id: 'campaign_123',
    timestamp: '2026-02-26T12:00:00Z',
  };

  const apiKey = 'test_api_key_secret';

  describe('generateSignature()', () => {
    it('should generate consistent HMAC signature', () => {
      const sig1 = generateSignature(mockPayload, apiKey);
      const sig2 = generateSignature(mockPayload, apiKey);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex = 64 chars
    });

    it('should generate different signatures for different payloads', () => {
      const sig1 = generateSignature(mockPayload, apiKey);
      const sig2 = generateSignature(
        { ...mockPayload, qualification_score: 50 },
        apiKey
      );

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different keys', () => {
      const sig1 = generateSignature(mockPayload, apiKey);
      const sig2 = generateSignature(mockPayload, 'different_key');

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('validateSignature()', () => {
    it('should validate correct signature', () => {
      const signature = generateSignature(mockPayload, apiKey);
      expect(validateSignature(mockPayload, signature, apiKey)).toBe(true);
    });

    it('should reject invalid signature', () => {
      const invalidSignature = '0'.repeat(64);
      expect(validateSignature(mockPayload, invalidSignature, apiKey)).toBe(false);
    });

    it('should reject signature with wrong key', () => {
      const signature = generateSignature(mockPayload, apiKey);
      expect(validateSignature(mockPayload, signature, 'wrong_key')).toBe(false);
    });

    it('should reject signature for modified payload', () => {
      const signature = generateSignature(mockPayload, apiKey);
      const modifiedPayload = { ...mockPayload, qualification_score: 0 };
      expect(validateSignature(modifiedPayload, signature, apiKey)).toBe(false);
    });
  });

  describe('sendWebhookWithRetry()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = vi.fn();
    });

    it('should send webhook successfully on first attempt', async () => {
      const mockResponse = new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
      });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should include correct headers', async () => {
      const mockResponse = new Response('ok', { status: 200 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey
      );

      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Webhook-Signature']).toMatch(/^[a-f0-9]{64}$/);
      expect(headers['X-Webhook-Timestamp']).toBeTruthy();
    });

    it('should retry on server error (5xx)', async () => {
      const mockErrorResponse = new Response('Server error', { status: 500 });
      const mockSuccessResponse = new Response('ok', { status: 200 });

      (global.fetch as any)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should not retry on client error (4xx)', async () => {
      const mockResponse = new Response('Not Found', { status: 404 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });

    it('should support custom retry config', async () => {
      const mockResponse = new Response('ok', { status: 200 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey,
        {
          maxRetries: 5,
          initialDelayMs: 500,
          backoffMultiplier: 3,
          timeoutMs: 60000,
        }
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('Network connection failed')
      );

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey,
        {
          maxRetries: 1,
          initialDelayMs: 10,
          backoffMultiplier: 2,
          timeoutMs: 30000,
        }
      );

      expect(result.success).toBe(false);
      expect(result.lastError).toBeTruthy();
    });

    it('should stop retrying after maxRetries', async () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await sendWebhookWithRetry(
        'https://example.com/webhook',
        mockPayload,
        apiKey,
        {
          maxRetries: 2,
          initialDelayMs: 10,
          backoffMultiplier: 2,
          timeoutMs: 30000,
        }
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3); // Initial + 2 retries
    });
  });

  describe('testWebhook()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = vi.fn();
    });

    it('should test webhook with reduced retry config', async () => {
      const mockResponse = new Response('ok', { status: 200 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await testWebhook('https://example.com/webhook', apiKey);

      expect(result.success).toBe(true);
      expect(result.message).toContain('working correctly');
    });

    it('should handle webhook test failure', async () => {
      const mockResponse = new Response('Server error', { status: 500 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await testWebhook('https://example.com/webhook', apiKey);

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should include test lead data in payload', async () => {
      const mockResponse = new Response('ok', { status: 200 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await testWebhook('https://example.com/webhook', apiKey);

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.event_type).toBe('lead_created');
      expect(body.lead_name).toBe('Test Lead');
      expect(body.email).toBe('test@example.com');
      expect(body.phone).toBe('(11) 99999-9999');
    });
  });
});
