// E2E tests for Briefing API endpoints
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { Server } from 'http';
import briefingsRouter from '../routes/briefings.js';
import { errorHandler } from '../middleware/error-handler.js';
import { ClientRepository } from '@shared/repositories/index.js';

let app: express.Application;
let server: Server;
const BASE_URL = 'http://localhost:3000/briefings';
let testClient: any;
let testBriefing: any;

beforeAll(async () => {
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  app.use('/briefings', briefingsRouter);
  app.use(errorHandler);

  // Start test server
  server = await new Promise((resolve) => {
    const s = app.listen(3000, () => {
      resolve(s);
    });
  });

  // Create test client
  testClient = await ClientRepository.create({
    name: `Test Client ${Date.now()}`,
    contact_email: `test-${Date.now()}@example.com`,
    segment: 'health',
  });
});

afterAll(async () => {
  // Cleanup
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

describe('Briefings API', () => {
  describe('POST /briefings', () => {
    it('should create a briefing with valid data (201)', async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          business_name: 'Test Business',
          segment: 'tech',
          target_audience: 'Startups',
          voice_tone: 'professional',
          objectives: ['Lead generation', 'Brand awareness'],
          differentiators: 'Innovative solutions',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as any;
      expect(data.data).toHaveProperty('id');
      expect(data.data.client_id).toBe(testClient.id);
      expect(data.data.status).toBe('draft');

      testBriefing = data.data;
    });

    it('should return 400 with missing required fields', async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          business_name: 'Test',
          // Missing segment, target_audience, voice_tone, objectives, differentiators
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
      expect(data.details).toBeDefined();
    });

    it('should return 400 with invalid client_id format', async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'not-a-uuid',
          business_name: 'Test Business',
          segment: 'tech',
          target_audience: 'Startups',
          voice_tone: 'professional',
          objectives: ['Lead generation'],
          differentiators: 'Innovative',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 with empty objectives array', async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          business_name: 'Test Business',
          segment: 'tech',
          target_audience: 'Startups',
          voice_tone: 'professional',
          objectives: [], // Empty
          differentiators: 'Innovative',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
      expect(data.details).toHaveProperty('objectives');
    });
  });

  describe('GET /briefings/:id', () => {
    it('should retrieve a briefing by ID (200)', async () => {
      expect(testBriefing).toBeDefined();

      const response = await fetch(`${BASE_URL}/${testBriefing.id}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.data.id).toBe(testBriefing.id);
      expect(data.data.client_id).toBe(testClient.id);
    });

    it('should return 404 for non-existent briefing', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/${fakeUuid}`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const data = await response.json() as any;
      expect(data.error_code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await fetch(`${BASE_URL}/invalid-id`, {
        method: 'GET',
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('INVALID_UUID');
    });
  });

  describe('GET /briefings?client_id=', () => {
    it('should list briefings for a client (200)', async () => {
      const response = await fetch(`${BASE_URL}?client_id=${testClient.id}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(1);
      expect(data.data.some((b: any) => b.id === testBriefing.id)).toBe(true);
    });

    it('should return 400 when client_id is missing', async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('MISSING_CLIENT_ID');
    });

    it('should return 400 for invalid client_id UUID', async () => {
      const response = await fetch(`${BASE_URL}?client_id=not-a-uuid`, {
        method: 'GET',
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /briefings/:id', () => {
    it('should update a briefing (200)', async () => {
      const response = await fetch(`${BASE_URL}/${testBriefing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: 'Updated Business Name',
          voice_tone: 'casual',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.data.business_name).toBe('Updated Business Name');
      expect(data.data.voice_tone).toBe('casual');
    });

    it('should return 404 for non-existent briefing', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/${fakeUuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: 'Updated',
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json() as any;
      expect(data.error_code).toBe('NOT_FOUND');
    });

    it('should return 400 with invalid update data', async () => {
      const response = await fetch(`${BASE_URL}/${testBriefing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'invalid-status', // Not in enum
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('VALIDATION_ERROR');
    });

    it('should allow updating status to valid values', async () => {
      const response = await fetch(`${BASE_URL}/${testBriefing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.data.status).toBe('approved');
    });
  });

  describe('DELETE /briefings/:id', () => {
    it('should delete a briefing (204)', async () => {
      // Create a briefing to delete
      const createResponse = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClient.id,
          business_name: 'To Delete',
          segment: 'tech',
          target_audience: 'Everyone',
          voice_tone: 'friendly',
          objectives: ['Test'],
          differentiators: 'Test',
        }),
      });

      const { data: createdBriefing } = await createResponse.json() as any;

      // Delete it
      const deleteResponse = await fetch(`${BASE_URL}/${createdBriefing.id}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(204);

      // Verify it's deleted
      const getResponse = await fetch(`${BASE_URL}/${createdBriefing.id}`, {
        method: 'GET',
      });
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for deleting non-existent briefing', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/${fakeUuid}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      const data = await response.json() as any;
      expect(data.error_code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await fetch(`${BASE_URL}/invalid-id`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error_code).toBe('INVALID_UUID');
    });
  });
});
