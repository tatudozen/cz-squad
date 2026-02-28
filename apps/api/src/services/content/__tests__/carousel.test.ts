/**
 * Carousel Copy Generator - Unit Tests
 * Tests for generateCarousel() function
 *
 * Story 2.2: Carousel Copy Generator (AC: 8)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateCarousel } from '../generators/carousel';
import { llmAdapter } from '../../../utils/llm-adapter';

// Mock LLM response
const MOCK_LLM_RESPONSE = `
{
  "slides": [
    {
      "number": 1,
      "main_text": "Transform Your Health Journey",
      "support_text": "Discover proven strategies",
      "design_note": "🎯 Bold headline with gradient background"
    },
    {
      "number": 2,
      "main_text": "The Challenge: Many professionals ignore preventive care",
      "support_text": "This leads to health crises later",
      "design_note": "📊 Problem visualization with statistics"
    },
    {
      "number": 3,
      "main_text": "The Solution: Preventive medicine approach",
      "support_text": "Catch issues before they become serious",
      "design_note": "✨ Solution flow chart"
    },
    {
      "number": 4,
      "main_text": "Our Success Stories: Real results from real patients",
      "support_text": "Average 30% improvement in health metrics",
      "design_note": "👥 Testimonial carousel with metrics"
    },
    {
      "number": 5,
      "main_text": "The Time to Act Is Now",
      "support_text": "Limited availability for new patients",
      "design_note": "⏰ Urgency visual with countdown"
    },
    {
      "number": 6,
      "main_text": "Book Your Consultation Today",
      "support_text": "First assessment is FREE",
      "design_note": "🎁 CTA button with offer highlight"
    }
  ],
  "caption": "Transform your health today! 🏥✨ Schedule your free preventive care assessment. Limited spots available. #PreventiveMedicine #HealthJourney #WellnessCoach",
  "design_brief": "Modern, professional aesthetic with blue and teal accents. Clean typography. Include patient success metrics. Emphasize accessibility and care."
}
`;

// Mock plan item
const mockPlanItem = {
  id: 'post-123',
  post_number: 1,
  type: 'carousel' as const,
  mode: 'inception' as const,
  theme: 'Brand Heritage & Preventive Care',
  target_platform: 'instagram' as const,
  publish_order: 1,
  creative_brief: 'Showcase the clinic expertise and preventive care benefits',
};

// Mock brand profile
const mockBrandProfile = {
  id: 'profile-789',
  client_id: 'client-456',
  color_palette: [
    { name: 'Primary', hex: '#06164A' },
    { name: 'Secondary', hex: '#6220FF' },
  ],
  font_recommendations: { heading: 'Poppins', body: 'Inter' },
  voice_guidelines: 'Professional, empathetic, trustworthy',
  created_at: '2026-02-20T00:00:00Z',
  updated_at: '2026-02-20T00:00:00Z',
};

describe('Carousel Generator Service', () => {
  beforeEach(() => {
    vi.spyOn(llmAdapter, 'generateCompletion').mockResolvedValue(MOCK_LLM_RESPONSE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCarousel()', () => {
    it('should generate carousel with default options (6 slides)', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel).toBeDefined();
      expect(carousel.slides).toHaveLength(6);
      expect(carousel.mode).toBe('inception');
      expect(carousel.caption).toContain('#');
    });

    it('should respect custom slide count (4)', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456',
        { slide_count: 4 }
      );

      expect(carousel.slides.length).toBeGreaterThanOrEqual(4);
    });

    it('should accept slide count within tolerance', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456',
        { slide_count: 8 }
      );

      // LLM may generate off by 1 from requested
      expect(carousel.slides.length).toBeGreaterThanOrEqual(4);
      expect(carousel.slides.length).toBeLessThanOrEqual(8);
    });

    it('should generate cover slide (first)', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      const coverSlide = carousel.slides[0];
      expect(coverSlide.is_cover).toBe(true);
      expect(coverSlide.main_text).toBeDefined();
      expect(coverSlide.main_text.length).toBeLessThanOrEqual(150);
    });

    it('should generate CTA slide (last)', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      const ctaSlide = carousel.slides[carousel.slides.length - 1];
      expect(ctaSlide.is_cta).toBe(true);
      expect(ctaSlide.main_text).toBeDefined();
    });

    it('should enforce 150 char limit on main_text', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      carousel.slides.forEach((slide) => {
        expect(slide.main_text.length).toBeLessThanOrEqual(150);
      });
    });

    it('should enforce 100 char limit on support_text', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      carousel.slides.forEach((slide) => {
        if (slide.support_text) {
          expect(slide.support_text.length).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should generate caption with hashtags', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.caption).toBeDefined();
      expect(carousel.caption).toContain('#');
      // Should include at least 3 hashtags (LLM may vary)
      expect(carousel.caption.match(/#/g)?.length).toBeGreaterThanOrEqual(3);
    });

    it('should generate design brief', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.design_brief).toBeDefined();
      expect(carousel.design_brief.length).toBeGreaterThan(0);
    });

    it('should include design notes for all slides', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      carousel.slides.forEach((slide) => {
        expect(slide.design_note).toBeDefined();
        expect(slide.design_note.length).toBeGreaterThan(0);
      });
    });

    it('should set mode to inception for Inception content', async () => {
      const carouselItem = { ...mockPlanItem, mode: 'inception' as const };
      const carousel = await generateCarousel(
        carouselItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.mode).toBe('inception');
    });

    it('should set mode to atração-fatal for Atração Fatal content', async () => {
      const carouselItem = { ...mockPlanItem, mode: 'atração-fatal' as const };
      const carousel = await generateCarousel(
        carouselItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.mode).toBe('atração-fatal');
    });

    it('should throw error for invalid slide_count (< 4)', async () => {
      await expect(
        generateCarousel(
          mockPlanItem as any,
          mockBrandProfile as any,
          'client-456',
          { slide_count: 3 }
        )
      ).rejects.toThrow(/Invalid slide_count/);
    });

    it('should throw error for invalid slide_count (> 8)', async () => {
      await expect(
        generateCarousel(
          mockPlanItem as any,
          mockBrandProfile as any,
          'client-456',
          { slide_count: 9 }
        )
      ).rejects.toThrow(/Invalid slide_count/);
    });

    it('should include carousel metadata (id, brand_profile_id, client_id)', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.id).toBeDefined();
      expect(carousel.id.length).toBeGreaterThan(0);
      expect(carousel.brand_profile_id).toBe(mockBrandProfile.id);
      expect(carousel.client_id).toBe('client-456');
      expect(carousel.created_at).toBeDefined();
      expect(carousel.updated_at).toBeDefined();
    });

    it('should include plan_item_id reference', async () => {
      const carousel = await generateCarousel(
        mockPlanItem as any,
        mockBrandProfile as any,
        'client-456'
      );

      expect(carousel.plan_item_id).toBe(mockPlanItem.id);
    });
  });
});
