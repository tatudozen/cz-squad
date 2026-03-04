import { describe, it, expect, beforeEach } from "vitest";
import { CarouselCopyGeneratorService } from "../services/generators/carousel.js";
import { BrandProfile } from "@copyzen/shared";

// ContentPost interface
interface ContentPost {
  type: 'carousel' | 'image';
  mode: 'inception' | 'atração-fatal';
  theme: string;
  targetPlatform: 'instagram' | 'linkedin';
  publishOrder: number;
  creativeBrief: string;
  funwheelCTA: string | null;
}

describe("CarouselCopyGeneratorService", () => {
  let service: CarouselCopyGeneratorService;
  let mockBrandProfile: BrandProfile;
  let mockContentPost: ContentPost;

  beforeEach(() => {
    service = new CarouselCopyGeneratorService();

    mockBrandProfile = {
      id: "456e7890-f01c-23e4-b567-537725285111",
      client_id: "client-123",
      briefing_id: "123e4567-e89b-12d3-a456-426614174000",
      color_palette: {
        primary: "#1E40AF",
        secondary: "#DC2626",
        accent: "#FBBF24",
        neutral: "#6B7280",
      },
      voice_guidelines: {
        tone: "professional, empathetic, conversational",
        keywords_to_use: ["saúde", "bem-estar"],
        keywords_to_avoid: [],
        example_phrases: [],
      },
      visual_style: "modern, clean, medical",
      font_recommendations: {
        heading: "Inter",
        body: "Inter",
      },
      created_at: new Date(),
    };

    mockContentPost = {
      type: "carousel",
      mode: "inception",
      theme: "Health Benefits of Regular Exercise",
      targetPlatform: "instagram",
      publishOrder: 1,
      creativeBrief: "Educational carousel about exercise benefits",
      funwheelCTA: null,
    };
  });

  it("should generate carousel with default 6 slides", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel).toBeDefined();
    expect(carousel.slides).toHaveLength(6);
    expect(carousel.mode).toBe("inception");
  });

  it("should generate carousel with custom slide count", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      { slide_count: 8 }
    );

    expect(carousel.slides).toHaveLength(8);
  });

  it("should have cover slide as first slide", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel.slides[0].is_cover).toBe(true);
    expect(carousel.slides[0].slide_number).toBe(1);
  });

  it("should have CTA slide as last slide", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    const lastSlide = carousel.slides[carousel.slides.length - 1];
    expect(lastSlide.is_cta).toBe(true);
  });

  it("should enforce 150 char limit on main_text", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    carousel.slides.forEach((slide) => {
      expect(slide.main_text.length).toBeLessThanOrEqual(150);
    });
  });

  it("should enforce 100 char limit on support_text", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    carousel.slides.forEach((slide) => {
      if (slide.support_text) {
        expect(slide.support_text.length).toBeLessThanOrEqual(100);
      }
    });
  });

  it("should generate caption with hashtags", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel.caption).toBeDefined();
    expect(carousel.caption).toContain("#");
  });

  it("should have design brief", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel.design_brief).toBeDefined();
    expect(carousel.design_brief.length).toBeGreaterThan(0);
  });

  it("should clamp slide_count between 4 and 8", async () => {
    const carouselTooMany = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      { slide_count: 20 }
    );

    expect(carouselTooMany.slides).toHaveLength(8);

    const carouselTooFew = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      { slide_count: 2 }
    );

    expect(carouselTooFew.slides).toHaveLength(4);
  });

  it("should support atração-fatal mode", async () => {
    const atraoPost: ContentPost = {
      ...mockContentPost,
      mode: "atração-fatal",
      funwheelCTA: "Saiba mais no FunWheel",
    };

    const carousel = await service.generateCarousel(
      atraoPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel.mode).toBe("atração-fatal");
  });

  it("should include timestamps", async () => {
    const carousel = await service.generateCarousel(
      mockContentPost,
      mockBrandProfile,
      "client-123"
    );

    expect(carousel.created_at).toBeDefined();
    expect(carousel.created_at).toBeInstanceOf(Date);
  });
});
