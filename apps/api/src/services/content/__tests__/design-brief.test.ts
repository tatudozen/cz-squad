/**
 * Design Brief Generator - Unit Tests
 * Tests for design brief generation functions
 *
 * Story 2.4: Visual Design Brief Generator (AC: 8)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateCarouselDesignBrief, generateStaticPostDesignBrief } from '../generators/design-brief';
import { llmAdapter } from '../../../utils/llm-adapter';

// Mock LLM response for carousel
const MOCK_CAROUSEL_BRIEF = `
{
  "color_palette": [
    {"name": "Primary", "hex": "#06164A", "usage": "Headlines and CTAs"},
    {"name": "Secondary", "hex": "#6220FF", "usage": "Accent elements and highlights"},
    {"name": "Accent", "hex": "#A1C8F7", "usage": "Supporting elements and borders"},
    {"name": "Neutral", "hex": "#F5F5F5", "usage": "Backgrounds and separators"}
  ],
  "typography": {
    "heading": "Poppins Bold, 28-32px",
    "body": "Inter Regular, 14-16px",
    "accent": "Muli SemiBold, 18-20px"
  },
  "spacing_guidelines": "Base unit: 16px. Scale: 8px, 16px, 24px, 32px, 48px",
  "layout_guidelines": "12-column grid system, 16px gutters, mobile-first responsive design",
  "imagery_style": "Modern professional photography with subtle overlays, warm natural lighting, authentic human connections",
  "slides_briefs": [
    {
      "slide_number": 1,
      "design_note": "🎯 Bold hero image with overlay text",
      "composition": "Full-width hero with text overlay in bottom third",
      "color_focus": "Primary blue (#06164A) with white text"
    },
    {
      "slide_number": 2,
      "design_note": "📊 Data visualization with statistics",
      "composition": "Split layout: 60% image, 40% stats",
      "color_focus": "Secondary purple (#6220FF) for emphasis"
    }
  ],
  "overall_aesthetic": "Professional, modern, trustworthy brand aesthetic emphasizing expertise and care"
}
`;

// Mock LLM response for static post
const MOCK_STATIC_POST_BRIEF = `
{
  "color_palette": [
    {"name": "Primary", "hex": "#06164A", "usage": "Main CTA and headlines"},
    {"name": "Secondary", "hex": "#6220FF", "usage": "Accent elements"},
    {"name": "Background", "hex": "#FFFFFF", "usage": "Primary background"},
    {"name": "Text", "hex": "#333333", "usage": "Body text"}
  ],
  "typography": {
    "heading": "Poppins Bold, 28-32px",
    "body": "Inter Regular, 14-16px",
    "accent": "Muli SemiBold, 18-20px"
  },
  "image_composition": "Hero image (1080x1350px) occupying full frame with 20% bottom overlay for text",
  "focal_point": "Top-left quadrant at rule of thirds intersection, drawing eye naturally to headline",
  "text_overlay_guidelines": "White text on 40% opacity black background, centered bottom, padding 20px",
  "imagery_style": "Bright, modern photography with warm lighting, authentic professional setting",
  "responsive_notes": "Mobile (1080x1350), Desktop (1200x628), scales proportionally maintaining focal point"
}
`;

// Mock carousel
const mockCarousel = {
  id: 'carousel-123',
  plan_item_id: 'plan-456',
  brand_profile_id: 'profile-789',
  client_id: 'client-111',
  mode: 'inception' as const,
  slides: [
    { slide_number: 1, main_text: 'Title', support_text: 'Subtitle', design_note: '🎯 Hero', is_cover: true, is_cta: false },
    { slide_number: 2, main_text: 'Content', support_text: 'Details', design_note: '📊 Stats', is_cover: false, is_cta: false },
  ],
  caption: 'Caption with hashtags',
  design_brief: 'Overall design direction',
  created_at: '2026-02-26T00:00:00Z',
  updated_at: '2026-02-26T00:00:00Z',
};

// Mock static post
const mockStaticPost = {
  id: 'post-456',
  plan_item_id: 'plan-789',
  brand_profile_id: 'profile-789',
  client_id: 'client-111',
  mode: 'inception' as const,
  platform: 'instagram' as const,
  main_text: 'Sample Instagram post content',
  hashtags: ['#hashtag1', '#hashtag2'],
  design_note: '📸 Hero image with overlay',
  character_count: 80,
  hashtag_count: 2,
  created_at: '2026-02-26T00:00:00Z',
  updated_at: '2026-02-26T00:00:00Z',
};

// Mock brand profile
const mockBrandProfile = {
  id: 'profile-789',
  client_id: 'client-111',
  color_palette: [
    { name: 'Primary', hex: '#06164A' },
    { name: 'Secondary', hex: '#6220FF' },
  ],
  font_recommendations: { heading: 'Poppins', body: 'Inter' },
  voice_guidelines: 'Professional, empathetic, trustworthy',
  created_at: '2026-02-20T00:00:00Z',
  updated_at: '2026-02-20T00:00:00Z',
};

describe('Design Brief Generator Service', () => {
  beforeEach(() => {
    vi.spyOn(llmAdapter, 'generateCompletion').mockImplementation((prompt) => {
      if (prompt.includes('carousel')) {
        return Promise.resolve(MOCK_CAROUSEL_BRIEF);
      }
      return Promise.resolve(MOCK_STATIC_POST_BRIEF);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCarouselDesignBrief()', () => {
    it('should generate carousel design brief', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief).toBeDefined();
      expect(brief.content_type).toBe('carousel');
      expect(brief.carousel_id).toBe(mockCarousel.id);
      expect(brief.color_palette).toHaveLength(4);
    });

    it('should include color palette specifications', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.color_palette).toBeDefined();
      brief.color_palette.forEach((color) => {
        expect(color.name).toBeDefined();
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
        expect(color.usage).toBeDefined();
      });
    });

    it('should include typography guidelines', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.typography).toBeDefined();
      expect(brief.typography.heading).toBeDefined();
      expect(brief.typography.body).toBeDefined();
    });

    it('should generate per-slide design briefs', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.slides_briefs).toBeDefined();
      expect(brief.slides_briefs.length).toBeGreaterThan(0);
      brief.slides_briefs.forEach((slide) => {
        expect(slide.slide_number).toBeGreaterThan(0);
        expect(slide.design_note).toBeDefined();
        expect(slide.composition).toBeDefined();
        expect(slide.color_focus).toBeDefined();
      });
    });

    it('should include layout and spacing guidelines', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.spacing_guidelines).toBeDefined();
      expect(brief.spacing_guidelines.length).toBeGreaterThan(0);
      expect(brief.layout_guidelines).toBeDefined();
      expect(brief.layout_guidelines.length).toBeGreaterThan(0);
    });

    it('should include imagery style recommendations', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.imagery_style).toBeDefined();
      expect(brief.imagery_style.length).toBeGreaterThan(0);
    });

    it('should include metadata (id, brand_profile_id, client_id)', async () => {
      const brief = await generateCarouselDesignBrief(
        mockCarousel as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.id).toBeDefined();
      expect(brief.id.length).toBeGreaterThan(0);
      expect(brief.brand_profile_id).toBe(mockBrandProfile.id);
      expect(brief.client_id).toBe('client-111');
      expect(brief.created_at).toBeDefined();
      expect(brief.updated_at).toBeDefined();
    });
  });

  describe('generateStaticPostDesignBrief()', () => {
    it('should generate static post design brief', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief).toBeDefined();
      expect(brief.content_type).toBe('static-post');
      expect(brief.post_id).toBe(mockStaticPost.id);
      expect(brief.platform).toBe('instagram');
    });

    it('should include color palette specifications', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.color_palette).toBeDefined();
      brief.color_palette.forEach((color) => {
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
        expect(color.usage).toBeDefined();
      });
    });

    it('should include image composition guidance', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.image_composition).toBeDefined();
      expect(brief.image_composition.length).toBeGreaterThan(0);
      expect(brief.focal_point).toBeDefined();
      expect(brief.focal_point.length).toBeGreaterThan(0);
    });

    it('should include text overlay guidelines', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.text_overlay_guidelines).toBeDefined();
      expect(brief.text_overlay_guidelines.length).toBeGreaterThan(0);
    });

    it('should include responsive design notes', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.responsive_notes).toBeDefined();
      expect(brief.responsive_notes.length).toBeGreaterThan(0);
    });

    it('should support Instagram platform', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.platform).toBe('instagram');
    });

    it('should support LinkedIn platform', async () => {
      const linkedinPost = { ...mockStaticPost, platform: 'linkedin' as const };
      const brief = await generateStaticPostDesignBrief(
        linkedinPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.platform).toBe('linkedin');
    });

    it('should include metadata (id, brand_profile_id, client_id)', async () => {
      const brief = await generateStaticPostDesignBrief(
        mockStaticPost as any,
        mockBrandProfile as any,
        'client-111'
      );

      expect(brief.id).toBeDefined();
      expect(brief.id.length).toBeGreaterThan(0);
      expect(brief.brand_profile_id).toBe(mockBrandProfile.id);
      expect(brief.client_id).toBe('client-111');
      expect(brief.post_id).toBe(mockStaticPost.id);
      expect(brief.created_at).toBeDefined();
      expect(brief.updated_at).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should throw error if LLM response is malformed', async () => {
      vi.spyOn(llmAdapter, 'generateCompletion').mockResolvedValue('Invalid JSON');

      await expect(
        generateCarouselDesignBrief(
          mockCarousel as any,
          mockBrandProfile as any,
          'client-111'
        )
      ).rejects.toThrow(/Failed to generate design brief/);
    });

    it('should throw error if design brief structure is invalid', async () => {
      vi.spyOn(llmAdapter, 'generateCompletion').mockResolvedValue(`
        {
          "color_palette": [],
          "typography": {"heading": "", "body": ""}
        }
      `);

      await expect(
        generateCarouselDesignBrief(
          mockCarousel as any,
          mockBrandProfile as any,
          'client-111'
        )
      ).rejects.toThrow(/Failed to generate design brief/);
    });
  });
});
