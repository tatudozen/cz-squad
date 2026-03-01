// E2E tests for Copy Generation API
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { Server } from 'http';
import copyRouter from '../routes/copy.js';
import { errorHandler } from '../middleware/error-handler.js';
import { ClientRepository, BriefingRepository, BrandProfileRepository } from '@shared/repositories/index.js';

let app: express.Application;
let server: Server;
const BASE_URL = 'http://localhost:3001/copy';

let testClient: any;
let testBriefing: any;
let testBrandProfile: any;

beforeAll(async () => {
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  app.use('/copy', copyRouter);
  app.use(errorHandler);

  // Start test server
  server = await new Promise((resolve) => {
    const s = app.listen(3001, () => {
      resolve(s);
    });
  });

  // Create test data
  testClient = await ClientRepository.create({
    name: `Copy Test Client ${Date.now()}`,
    contact_email: `copy-test-${Date.now()}@example.com`,
    segment: 'health',
  });

  testBriefing = await BriefingRepository.create({
    client_id: testClient.id,
    business_name: 'Clínica Silva',
    segment: 'health',
    target_audience: 'Mulheres 30-50',
    voice_tone: 'consultivo, profissional',
    differentiators: 'Atendimento humanizado',
    differentiators: 'Atendimento humanizado, 20 anos de experiência',
  });

  testBrandProfile = await BrandProfileRepository.create({
    client_id: testClient.id,
    briefing_id: testBriefing.id,
    color_palette: {
      primary: '#06164A',
      secondary: '#6220FF',
      accent: '#ED145B',
      neutral: '#A1C8F7',
    },
    voice_guidelines: {
      tone: 'Consultivo, profissional, acessível',
      keywords_to_use: ['transformação', 'confiança', 'bem-estar'],
      keywords_to_avoid: ['agressivo', 'invasivo', 'técnico demais'],
      example_phrases: [
        'Sua saúde é nossa prioridade',
        'Transformamos vidas',
        'Confiança, cuidado, resultado',
      ],
    },
    visual_style: 'moderno, limpo, acessível',
  });
});

afterAll(async () => {
  // Cleanup
  if (testBrandProfile?.id) {
    try {
      await BrandProfileRepository.delete(testBrandProfile.id);
    } catch (_error) {
      // Already deleted
    }
  }

  if (testBriefing?.id) {
    try {
      await BriefingRepository.delete(testBriefing.id);
    } catch (_error) {
      // Already deleted
    }
  }

  if (testClient?.id) {
    try {
      await ClientRepository.delete(testClient.id);
    } catch (_error) {
      // Already deleted
    }
  }

  // Close server
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Copy Generation API', () => {
  describe('Copy Type Generation', () => {
    it('should generate headline copy (200)', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'headline',
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.data.copy_type).toBe('headline');
      expect(data.data.character_count).toBeGreaterThan(0);
      expect(data.data.validation).toBeDefined();
      expect(data.data.generated_copy).toMatch(/transforme|revolucione|otimize|potencialize/i);
    });

    it('should generate subheadline copy', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'subheadline',
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.data.copy_type).toBe('subheadline');
      expect(data.data.character_count).toBeGreaterThan(30);
    });

    it('should generate body_text copy', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'body_text',
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.data.copy_type).toBe('body_text');
      expect(data.data.character_count).toBeGreaterThan(100);
    });

    it('should generate cta copy', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'cta',
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.data.copy_type).toBe('cta');
      expect(data.data.character_count).toBeLessThan(50);
    });

    it('should generate social_post copy', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'social_post',
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.data.copy_type).toBe('social_post');
      expect(data.data.character_count).toBeLessThan(280);
    });
  });

  describe('Validation', () => {
    it('should validate copy respects tone guidelines', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'headline',
        }),
      });

      const data = (await response.json()) as any;
      expect(data.data.validation.respects_tone).toBe(true);
    });

    it('should check for keyword inclusion', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'headline',
        }),
      });

      const data = (await response.json()) as any;
      expect(Array.isArray(data.data.validation.includes_keywords)).toBe(true);
    });

    it('should avoid forbidden keywords', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'body_text',
        }),
      });

      const data = (await response.json()) as any;
      expect(data.data.validation.avoids_forbidden).toBe(true);
      const copyText = data.data.generated_copy.toLowerCase();
      expect(copyText).not.toMatch(/agressivo|invasivo|técnico demais/);
    });

    it('should enforce copy length constraints', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'cta',
        }),
      });

      const data = (await response.json()) as any;
      expect(data.data.validation.is_within_length).toBe(true);
      expect(data.data.character_count).toBeGreaterThanOrEqual(10);
      expect(data.data.character_count).toBeLessThanOrEqual(50);
    });

    it('should calculate confidence score', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'headline',
        }),
      });

      const data = (await response.json()) as any;
      expect(data.data.validation.confidence_score).toBeGreaterThan(0);
      expect(data.data.validation.confidence_score).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid copy type', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'invalid_type',
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for missing brand profile', async () => {
      const fakeProfileId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: fakeProfileId,
          copy_type: 'headline',
        }),
      });

      expect(response.status).toBe(404);
      const data = (await response.json()) as any;
      expect(data.error_code).toBe('NOT_FOUND');
    });

    it('should return 403 if brand profile does not belong to client', async () => {
      // Create another client and brand profile
      const otherClient = await ClientRepository.create({
        name: `Other Client ${Date.now()}`,
        contact_email: `other-${Date.now()}@example.com`,
        segment: 'tech',
      });

      const otherBriefing = await BriefingRepository.create({
        client_id: otherClient.id,
        business_name: 'Tech Company',
        segment: 'tech',
        target_audience: 'Developers',
        voice_tone: 'casual',
        objectives: ['Growth'],
        differentiators: 'Innovation',
      });

      const otherProfile = await BrandProfileRepository.create({
        client_id: otherClient.id,
        briefing_id: otherBriefing.id,
        color_palette: {
          primary: '#0066CC',
          secondary: '#00CC99',
          accent: '#FF6B35',
          neutral: '#E0E7FF',
        },
        voice_guidelines: {
          tone: 'Casual, innovative',
          keywords_to_use: ['tech', 'innovation'],
          keywords_to_avoid: ['outdated'],
          example_phrases: ['Stay ahead', 'Build the future'],
        },
      });

      // Try to use other client's profile with wrong client ID
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id, // Different client
          brand_profile_id: otherProfile.id,
          copy_type: 'headline',
        }),
      });

      expect(response.status).toBe(403);

      // Cleanup
      await BrandProfileRepository.delete(otherProfile.id);
      await BriefingRepository.delete(otherBriefing.id);
      await ClientRepository.delete(otherClient.id);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          // Missing brand_profile_id and copy_type
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Metrics', () => {
    it('should include generation metrics in response', async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          brand_profile_id: testBrandProfile.id,
          copy_type: 'headline',
        }),
      });

      const data = (await response.json()) as any;
      expect(data.data.generation_metrics).toBeDefined();
      expect(data.data.generation_metrics.tokens_used).toBeGreaterThan(0);
      expect(data.data.generation_metrics.time_ms).toBeGreaterThanOrEqual(0);
      expect(data.data.generation_metrics.cost_usd).toBeGreaterThan(0);
      expect(data.data.generation_metrics.model).toBe('claude-3-5-sonnet');
    });
  });
});
