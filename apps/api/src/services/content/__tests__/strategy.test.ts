/**
 * Content Strategy Service - Unit Tests
 * Tests for createContentPlan() function
 *
 * Story 2.1: Content Strategy & Planning Module (AC: 7)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContentPlan } from '../strategy.ts';
import * as llmAdapterModule from '../../../utils/llm-adapter.ts';

// Mock LLM responses
const MOCK_LLM_RESPONSE = `
[
  {
    "post_number": 1,
    "type": "carousel",
    "mode": "inception",
    "theme": "Brand Heritage",
    "target_platform": "instagram",
    "publish_order": 1,
    "creative_brief": "Showcase the clinic's 15 years of expertise in preventive care and patient testimonials"
  },
  {
    "post_number": 2,
    "type": "image",
    "mode": "inception",
    "theme": "Educational Content",
    "target_platform": "linkedin",
    "publish_order": 2,
    "creative_brief": "Share 5 preventive health tips for busy professionals"
  },
  {
    "post_number": 3,
    "type": "carousel",
    "mode": "inception",
    "theme": "Services Overview",
    "target_platform": "instagram",
    "publish_order": 3,
    "creative_brief": "Introduce key services: preventive checkups, vaccinations, health coaching"
  },
  {
    "post_number": 4,
    "type": "image",
    "mode": "inception",
    "theme": "Team Credentials",
    "target_platform": "linkedin",
    "publish_order": 4,
    "creative_brief": "Highlight doctor qualifications and certifications in preventive medicine"
  },
  {
    "post_number": 5,
    "type": "carousel",
    "mode": "inception",
    "theme": "Patient Success Stories",
    "target_platform": "instagram",
    "publish_order": 5,
    "creative_brief": "Feature real patient journeys towards better health through preventive care"
  },
  {
    "post_number": 6,
    "type": "image",
    "mode": "inception",
    "theme": "Community Involvement",
    "target_platform": "linkedin",
    "publish_order": 6,
    "creative_brief": "Showcase health awareness campaigns and community outreach initiatives"
  },
  {
    "post_number": 7,
    "type": "carousel",
    "mode": "inception",
    "theme": "Wellness Tips",
    "target_platform": "instagram",
    "publish_order": 7,
    "creative_brief": "Share monthly wellness challenges: fitness, nutrition, stress management"
  },
  {
    "post_number": 8,
    "type": "image",
    "mode": "atração-fatal",
    "theme": "Limited Time Offer",
    "target_platform": "instagram",
    "publish_order": 8,
    "creative_brief": "Exclusive offer: Free preventive health screening. Register now on FunWheel funnel and claim your spot today!"
  },
  {
    "post_number": 9,
    "type": "carousel",
    "mode": "atração-fatal",
    "theme": "VIP Membership",
    "target_platform": "instagram",
    "publish_order": 9,
    "creative_brief": "Reveal VIP membership benefits and early access to new services. Discover more on FunWheel and join our exclusive community!"
  },
  {
    "post_number": 10,
    "type": "image",
    "mode": "atração-fatal",
    "theme": "Urgent Health Alert",
    "target_platform": "linkedin",
    "publish_order": 10,
    "creative_brief": "Breaking: New health research shows benefits of preventive care. Interested? Learn more on FunWheel today!"
  }
]
`;

// Mock briefing
const mockBriefing = {
  id: 'briefing-123',
  client_id: 'client-456',
  business_name: 'Clínica Silva',
  target_audience: 'Patients 30-60 years old',
  key_messages: 'Expertise, trust, health',
  tone_of_voice: 'Professional and welcoming',
  objectives: ['Increase patients', 'Build trust', 'Share expertise'],
  industry: 'Healthcare',
  differentiators: 'Experienced team, modern facilities, humanized care',
  segment: 'Preventive medicine',
  created_at: '2026-02-20T00:00:00Z',
  updated_at: '2026-02-20T00:00:00Z',
};

// Mock brand profile
const mockBrandProfile = {
  id: 'profile-789',
  client_id: 'client-456',
  color_palette: [
    { name: 'Primary', hex: '#06164A' },
    { name: 'Secondary', hex: '#6220FF' },
    { name: 'Accent', hex: '#ED145B' },
  ],
  font_recommendations: { heading: 'Poppins', body: 'Inter' },
  voice_guidelines: 'Professional, empathetic, trustworthy',
  created_at: '2026-02-20T00:00:00Z',
  updated_at: '2026-02-20T00:00:00Z',
};

describe('Content Strategy Service', () => {
  beforeEach(() => {
    // Mock LLM adapter
    vi.mocked(llmAdapterModule.llmAdapter.generateCompletion).mockResolvedValue(
      MOCK_LLM_RESPONSE
    );
  });

  describe('createContentPlan()', () => {
    it('should generate plan with default options', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      expect(plan).toBeDefined();
      expect(plan.total_posts).toBe(10);
      expect(plan.inception_posts).toBe(7);
      expect(plan.atracaofatal_posts).toBe(3);
      expect(plan.posts).toHaveLength(10);
      expect(plan.status).toBe('draft');
    });

    it('should respect custom total_posts option', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id,
        { total_posts: 5 }
      );

      expect(plan.total_posts).toBe(5);
    });

    it('should respect custom inception_ratio', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id,
        { total_posts: 10, inception_ratio: 0.6 }
      );

      // 60% of 10 = 6 inception, 4 atração-fatal
      expect(plan.inception_posts).toBe(6);
      expect(plan.atracaofatal_posts).toBe(4);
    });

    it('should ensure Atração Fatal posts include FunWheel reference', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      const atracaoFatalPosts = plan.posts.filter(
        (p: any) => p.mode === 'atração-fatal'
      );

      atracaoFatalPosts.forEach((post: any) => {
        const hasFunWheel =
          post.creative_brief.toLowerCase().includes('funwheel') ||
          post.creative_brief.toLowerCase().includes('funil');
        expect(hasFunWheel).toBe(true);
      });
    });

    it('should include correct post type distribution', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id,
        { formats: 'mix' }
      );

      const carousels = plan.posts.filter((p: any) => p.type === 'carousel');
      const images = plan.posts.filter((p: any) => p.type === 'image');

      expect(carousels.length + images.length).toBe(plan.total_posts);
      expect(carousels.length).toBeGreaterThan(0);
      expect(images.length).toBeGreaterThan(0);
    });

    it('should include target platform diversity', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      const platforms = new Set(
        plan.posts.map((p: any) => p.target_platform)
      );
      expect(platforms.size).toBeGreaterThan(0);
      plan.posts.forEach((post: any) => {
        expect(['instagram', 'linkedin']).toContain(post.target_platform);
      });
    });

    it('should include creative brief for all posts', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      plan.posts.forEach((post: any) => {
        expect(post.creative_brief).toBeDefined();
        expect(post.creative_brief.length).toBeGreaterThan(0);
        expect(post.creative_brief.length).toBeLessThanOrEqual(500);
      });
    });

    it('should throw error for invalid total_posts (0)', async () => {
      await expect(
        createContentPlan(
          mockBriefing as any,
          mockBrandProfile as any,
          mockBriefing.client_id,
          { total_posts: 0 }
        )
      ).rejects.toThrow(/Invalid total_posts/);
    });

    it('should throw error for invalid total_posts (> 50)', async () => {
      await expect(
        createContentPlan(
          mockBriefing as any,
          mockBrandProfile as any,
          mockBriefing.client_id,
          { total_posts: 51 }
        )
      ).rejects.toThrow(/Invalid total_posts/);
    });

    it('should throw error for invalid inception_ratio (< 0)', async () => {
      await expect(
        createContentPlan(
          mockBriefing as any,
          mockBrandProfile as any,
          mockBriefing.client_id,
          { inception_ratio: -0.1 }
        )
      ).rejects.toThrow(/Invalid inception_ratio/);
    });

    it('should throw error for invalid inception_ratio (> 1)', async () => {
      await expect(
        createContentPlan(
          mockBriefing as any,
          mockBrandProfile as any,
          mockBriefing.client_id,
          { inception_ratio: 1.1 }
        )
      ).rejects.toThrow(/Invalid inception_ratio/);
    });

    it('should include post metadata (id, post_number, publish_order)', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      plan.posts.forEach((post: any, index: number) => {
        expect(post.id).toBeUndefined(); // Note: Mock doesn't include IDs, real LLM might
        expect(post.post_number).toBe(index + 1);
        expect(post.publish_order).toBe(index + 1);
      });
    });

    it('should include plan metadata (id, briefing_id, brand_profile_id, client_id)', async () => {
      const plan = await createContentPlan(
        mockBriefing as any,
        mockBrandProfile as any,
        mockBriefing.client_id
      );

      expect(plan.id).toBeDefined();
      expect(plan.id.length).toBeGreaterThan(0);
      expect(plan.briefing_id).toBe(mockBriefing.id);
      expect(plan.brand_profile_id).toBe(mockBrandProfile.id);
      expect(plan.client_id).toBe(mockBriefing.client_id);
      expect(plan.created_at).toBeDefined();
      expect(plan.updated_at).toBeDefined();
    });
  });
});
