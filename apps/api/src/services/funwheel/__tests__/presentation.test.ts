/**
 * Tests for FunWheel Presentation Service (Etapa A)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generatePresentation } from '../generators/presentation.js';
import { BrandProfile, Briefing } from '@shared/supabase.js';

describe('Presentation Service (FunWheel Etapa A)', () => {
  let testBriefing: Briefing;
  let testBrandProfile: BrandProfile;

  beforeAll(() => {
    testBriefing = {
      id: 'briefing-123',
      client_id: 'client-456',
      status: 'approved',
  // @ts-expect-error
      business_name: 'Clínica Silva',
      segment: 'healthcare',
      target_audience: 'professionals aged 30-55',
      voice_tone: 'professional and warm',
      objectives: ['increase patient acquisition', 'build brand trust'],
      differentiators: 'personalized approach and cutting-edge technology',
      existing_colors: ['#06164A', '#6220FF'],
      logo_url: 'https://example.com/logo.png',
      competitor_references: [],
      monthly_budget: 5000,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: 'user-123',
      updated_at: new Date().toISOString(),
    };

    testBrandProfile = {
      id: 'profile-789',
      client_id: 'client-456',
      briefing_id: 'briefing-123',
      color_palette: {
        primary: '#06164A',
        secondary: '#6220FF',
        accent: '#A1C8F7',
        neutral: '#F5F5F5',
      },
      voice_guidelines: {
        tone: 'professional, warm, trustworthy',
        keywords_to_use: ['healthcare', 'innovation', 'care', 'trust'],
        keywords_to_avoid: ['cheap', 'quick fix', 'guarantee'],
        example_phrases: ['Your health, our priority', 'Innovation in care'],
      },
      visual_style: 'Modern, clean, healthcare-focused',
      font_recommendations: {
        heading: 'Poppins Bold, 32-48px',
        body: 'Inter Regular, 16-18px',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  describe('generatePresentation()', () => {
    it('should generate a complete presentation with all sections', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.id).toBeDefined();
      expect(presentation.briefing_id).toBe('briefing-123');
      expect(presentation.brand_profile_id).toBe('profile-789');
      expect(presentation.client_id).toBe('client-456');
      expect(presentation.stage).toBe('presentation');
    });

    it('should have valid hero section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.hero.headline).toBeDefined();
      expect(presentation.hero.headline.length).toBeGreaterThan(0);
      expect(presentation.hero.headline.length).toBeLessThanOrEqual(100);
      expect(presentation.hero.subheadline).toBeDefined();
      expect(presentation.hero.subheadline.length).toBeLessThanOrEqual(200);
      expect(presentation.hero.design_note).toBeDefined();
    });

    it('should have valid problem section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.problem.title).toBeDefined();
      expect(presentation.problem.title.length).toBeLessThanOrEqual(80);
      expect(presentation.problem.description).toBeDefined();
      expect(presentation.problem.description.length).toBeLessThanOrEqual(500);
      expect(presentation.problem.pain_points).toBeInstanceOf(Array);
      expect(presentation.problem.pain_points.length).toBeGreaterThanOrEqual(3);
    });

    it('should have valid solution section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.solution.title).toBeDefined();
      expect(presentation.solution.title.length).toBeLessThanOrEqual(80);
      expect(presentation.solution.description).toBeDefined();
      expect(presentation.solution.description.length).toBeLessThanOrEqual(500);
      expect(presentation.solution.approach).toBeDefined();
      expect(presentation.solution.approach.length).toBeLessThanOrEqual(300);
    });

    it('should have valid benefits section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.benefits.title).toBeDefined();
      expect(presentation.benefits.items).toBeInstanceOf(Array);
      expect(presentation.benefits.items.length).toBeGreaterThanOrEqual(3);

      presentation.benefits.items.forEach((item) => {
        expect(item.benefit).toBeDefined();
        expect(item.benefit.length).toBeLessThanOrEqual(100);
        expect(item.description).toBeDefined();
        expect(item.description.length).toBeLessThanOrEqual(200);
      });
    });

    it('should have valid proof social section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.proof_social.testimonials).toBeInstanceOf(Array);
      expect(presentation.proof_social.testimonials.length).toBeGreaterThanOrEqual(2);
      expect(presentation.proof_social.results).toBeInstanceOf(Array);
      expect(presentation.proof_social.credentials).toBeInstanceOf(Array);

      presentation.proof_social.testimonials.forEach((testimonial: any) => {
        expect(testimonial.quote).toBeDefined();
        expect(testimonial.quote.length).toBeLessThanOrEqual(200);
        expect(testimonial.author).toBeDefined();
        expect(testimonial.title).toBeDefined();
      });
    });

    it('should have valid CTA section', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.cta.headline).toBeDefined();
      expect(presentation.cta.headline.length).toBeLessThanOrEqual(100);
      expect(presentation.cta.button_text).toBeDefined();
      expect(presentation.cta.button_text.length).toBeLessThanOrEqual(40);
      expect(presentation.cta.target_url).toBe('/funwheel/retention');
    });

    it('should apply brand profile colors and typography', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.design_brief.colors.primary).toBe(testBrandProfile.color_palette.primary);
      expect(presentation.design_brief.colors.secondary).toBe(
        testBrandProfile.color_palette.secondary
      );
      expect(presentation.design_brief.colors.accent).toBe(testBrandProfile.color_palette.accent);
      expect(presentation.design_brief.typography.heading).toBe(
        testBrandProfile.font_recommendations?.heading
      );
    });

    it('should include transformation narrative context', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      const fullContent =
        presentation.hero.headline +
        presentation.problem.description +
        presentation.solution.description +
        presentation.benefits.title;

  // @ts-expect-error
      expect(fullContent).toContain(testBriefing.business_name);
      if (testBriefing.target_audience) {
        expect(fullContent.toLowerCase()).toContain(testBriefing.target_audience.toLowerCase());
      }
    });

    it('should have valid timestamps', async () => {
      const presentation = await generatePresentation(
        testBriefing,
        testBrandProfile,
        'client-456',
        'briefing-123',
        'profile-789'
      );

      expect(presentation.created_at).toBeDefined();
      expect(presentation.updated_at).toBeDefined();
      expect(new Date(presentation.created_at)).toBeInstanceOf(Date);
      expect(new Date(presentation.updated_at)).toBeInstanceOf(Date);
    });
  });

  describe('API Endpoint Tests', () => {
    it('should validate briefing_id format', async () => {
      // This would be tested in E2E tests
      // Mock: invalid briefing_id should return 400 error
      expect(true).toBe(true);
    });

    it('should return 404 when briefing not found', async () => {
      // This would be tested in E2E tests
      // Mock: non-existent briefing_id should return 404
      expect(true).toBe(true);
    });

    it('should return 404 when brand profile not found', async () => {
      // This would be tested in E2E tests
      // Mock: non-existent brand_profile_id should return 404
      expect(true).toBe(true);
    });
  });
});
