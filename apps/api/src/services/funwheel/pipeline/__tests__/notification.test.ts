/**
 * Tests for Notification Service
 */

import { describe, it, expect } from 'vitest';
import {
  EvolutionClient,
  generateWhatsAppMessage,
  sendLeadNotification,
  validateEvolutionConfig,
} from '../notification.js';
import type { LeadEventData } from '../../../../types/funwheel.js';
import type { EvolutionApiConfig } from '../notification.js';

describe('Notification Service', () => {
  const mockConfig: EvolutionApiConfig = {
    apiUrl: 'https://api.evolution.app',
    apiKey: 'test_key_123',
    instanceId: 'instance_123',
  };

  describe('EvolutionClient', () => {
    it('should initialize with config', () => {
      const client = new EvolutionClient(mockConfig);
      expect(client).toBeDefined();
    });

    it('should validate phone format', async () => {
      const client = new EvolutionClient(mockConfig);

      // Valid format
      const validResult = await client.sendMessage('(11) 99999-9999', 'Test message');
      expect(validResult.status).toBe('queued');
      expect(validResult.messageId).toBeTruthy();

      // Invalid format
      const invalidResult = await client.sendMessage('11999999999', 'Test message');
      expect(invalidResult.status).toBe('error');
      expect(invalidResult.error).toContain('Invalid phone format');
    });

    it('should generate unique message IDs', async () => {
      const client = new EvolutionClient(mockConfig);

      const result1 = await client.sendMessage('(11) 99999-9999', 'Message 1');
      const result2 = await client.sendMessage('(21) 98888-8888', 'Message 2');

      expect(result1.messageId).not.toBe(result2.messageId);
    });

    it('should test connection', async () => {
      const client = new EvolutionClient(mockConfig);
      const connected = await client.testConnection();
      expect(connected).toBe(true);
    });
  });

  describe('generateWhatsAppMessage()', () => {
    it('should generate hot tier message', () => {
      const message = generateWhatsAppMessage('hot', 'João Silva', 'https://example.com/schedule');
      expect(message).toContain('João');
      expect(message).toContain('agendar');
      expect(message).toContain('https://example.com/schedule');
    });

    it('should generate warm tier message', () => {
      const message = generateWhatsAppMessage('warm', 'Maria Santos', 'https://example.com/resources');
      expect(message).toContain('Maria');
      expect(message).toContain('recursos');
      expect(message).toContain('https://example.com/resources');
    });

    it('should generate cold tier message', () => {
      const message = generateWhatsAppMessage('cold', 'Pedro Costa', 'https://example.com/learn');
      expect(message).toContain('Pedro');
      expect(message).toContain('educativo');
      expect(message).toContain('https://example.com/learn');
    });

    it('should use first name only', () => {
      const message = generateWhatsAppMessage('hot', 'João da Silva', 'https://example.com');
      expect(message).toContain('João');
    });
  });

  describe('sendLeadNotification()', () => {
    it('should send notification with tier-specific message', async () => {
      const client = new EvolutionClient(mockConfig);
      const leadData: LeadEventData = {
        lead_name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        campaign_id: 'campaign_123',
        presentation_id: 'presentation_123',
        qualification_tier: 'hot',
      };

      const result = await sendLeadNotification(client, leadData, 'hot');
      expect(result.status).toBe('queued');
      expect(result.messageId).toBeTruthy();
    });

    it('should handle invalid phone format', async () => {
      const client = new EvolutionClient(mockConfig);
      const leadData: LeadEventData = {
        lead_name: 'Maria Santos',
        email: 'maria@example.com',
        phone: '11999999999', // Invalid format
        campaign_id: 'campaign_123',
        presentation_id: 'presentation_123',
      };

      const result = await sendLeadNotification(client, leadData, 'warm');
      expect(result.status).toBe('error');
    });

    it('should include phone number in all tiers', async () => {
      const client = new EvolutionClient(mockConfig);

      for (const tier of ['hot', 'warm', 'cold'] as const) {
        const leadData: LeadEventData = {
          lead_name: 'Test User',
          email: 'test@example.com',
          phone: '(21) 98888-8888',
          campaign_id: 'campaign_123',
          presentation_id: 'presentation_123',
          qualification_tier: tier,
        };

        const result = await sendLeadNotification(client, leadData, tier);
        expect(result.status).toBe('queued');
      }
    });
  });

  describe('validateEvolutionConfig()', () => {
    it('should validate complete config', () => {
      const config: EvolutionApiConfig = {
        apiUrl: 'https://api.evolution.app',
        apiKey: 'key_123',
        instanceId: 'instance_123',
      };
      expect(validateEvolutionConfig(config)).toBe(true);
    });

    it('should reject incomplete config', () => {
      const config: EvolutionApiConfig = {
        apiUrl: '',
        apiKey: 'key_123',
        instanceId: 'instance_123',
      };
      expect(validateEvolutionConfig(config)).toBe(false);
    });

    it('should reject config with missing apiKey', () => {
      const config: EvolutionApiConfig = {
        apiUrl: 'https://api.evolution.app',
        apiKey: '',
        instanceId: 'instance_123',
      };
      expect(validateEvolutionConfig(config)).toBe(false);
    });

    it('should reject config with missing instanceId', () => {
      const config: EvolutionApiConfig = {
        apiUrl: 'https://api.evolution.app',
        apiKey: 'key_123',
        instanceId: '',
      };
      expect(validateEvolutionConfig(config)).toBe(false);
    });
  });
});
