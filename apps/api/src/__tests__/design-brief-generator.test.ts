import { describe, it, expect, beforeEach } from "vitest";
import { DesignBriefGeneratorService } from "../services/generators/design-brief.js";
import { BrandProfile } from "@copyzen/shared";

describe("DesignBriefGeneratorService", () => {
  let service: DesignBriefGeneratorService;
  let mockBrandProfile: BrandProfile;

  beforeEach(() => {
    service = new DesignBriefGeneratorService();

    mockBrandProfile = {
      id: "brand-123",
      client_id: "client-123",
      briefing_id: "briefing-123",
      color_palette: {
        primary: "#1E40AF",
        secondary: "#DC2626",
        accent: "#FBBF24",
        neutral: "#6B7280",
      },
      voice_guidelines: {
        tone: "professional",
        keywords_to_use: [],
        keywords_to_avoid: [],
        example_phrases: [],
      },
      visual_style: "modern",
      font_recommendations: { heading: "Inter", body: "Inter" },
      created_at: new Date(),
    };
  });

  it("should generate carousel design brief with colors", async () => {
    const carousel = {
      plan_item_id: "plan-1",
      brand_profile_id: "brand-123",
      mode: "inception" as const,
      slides: [
        {
          slide_number: 1,
          main_text: "Cover",
          design_note: "Bold",
          is_cover: true,
          is_cta: false,
        },
        {
          slide_number: 2,
          main_text: "Content",
          design_note: "Clean",
          is_cover: false,
          is_cta: false,
        },
      ],
      caption: "Caption",
      design_brief: "Brief",
    };

    const brief = await service.generateCarouselDesignBrief(
      carousel,
      mockBrandProfile,
      "client-123"
    );

    expect(brief.colors).toBeDefined();
    expect(brief.colors.length).toBeGreaterThan(0);
    expect(brief.content_type).toBe("carousel");
  });

  it("should include typography specs", async () => {
    const carousel = {
      plan_item_id: "plan-1",
      brand_profile_id: "brand-123",
      mode: "inception" as const,
      slides: [
        {
          slide_number: 1,
          main_text: "Cover",
          design_note: "Bold",
          is_cover: true,
          is_cta: false,
        },
      ],
      caption: "Caption",
      design_brief: "Brief",
    };

    const brief = await service.generateCarouselDesignBrief(
      carousel,
      mockBrandProfile,
      "client-123"
    );

    expect(brief.typography).toBeDefined();
    expect(brief.typography.heading).toBeDefined();
    expect(brief.typography.body).toBeDefined();
  });

  it("should generate static post design brief", async () => {
    const post = {
      plan_item_id: "plan-1",
      brand_profile_id: "brand-123",
      mode: "inception" as const,
      platform: "instagram" as const,
      main_text: "Post content",
      hashtags: ["#tag1"],
      design_note: "Modern",
      character_count: 50,
      hashtag_count: 1,
    };

    const brief = await service.generateStaticPostDesignBrief(
      post,
      mockBrandProfile,
      "client-123"
    );

    expect(brief.content_type).toBe("static_post");
    expect(brief.colors).toBeDefined();
    expect(brief.typography).toBeDefined();
  });

  it("should include per-slide notes for carousels", async () => {
    const carousel = {
      plan_item_id: "plan-1",
      brand_profile_id: "brand-123",
      mode: "inception" as const,
      slides: [
        {
          slide_number: 1,
          main_text: "Slide 1",
          design_note: "Note 1",
          is_cover: true,
          is_cta: false,
        },
        {
          slide_number: 2,
          main_text: "Slide 2",
          design_note: "Note 2",
          is_cover: false,
          is_cta: false,
        },
      ],
      caption: "Caption",
      design_brief: "Brief",
    };

    const brief = await service.generateCarouselDesignBrief(
      carousel,
      mockBrandProfile,
      "client-123"
    );

    expect(brief.per_slide_notes).toBeDefined();
  });
});
