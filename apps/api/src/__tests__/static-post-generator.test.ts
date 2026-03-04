import { describe, it, expect, beforeEach } from "vitest";
import { StaticPostCopyGeneratorService } from "../services/generators/static-post.js";
import { BrandProfile } from "@copyzen/shared";

interface ContentPost {
  type: 'carousel' | 'image';
  mode: 'inception' | 'atração-fatal';
  theme: string;
  targetPlatform: 'instagram' | 'linkedin';
  publishOrder: number;
  creativeBrief: string;
  funwheelCTA: string | null;
}

describe("StaticPostCopyGeneratorService", () => {
  let service: StaticPostCopyGeneratorService;
  let mockBrandProfile: BrandProfile;
  let mockContentPost: ContentPost;

  beforeEach(() => {
    service = new StaticPostCopyGeneratorService();

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
        tone: "professional, empathetic",
        keywords_to_use: ["saúde"],
        keywords_to_avoid: [],
        example_phrases: [],
      },
      visual_style: "modern",
      font_recommendations: { heading: "Inter", body: "Inter" },
      created_at: new Date(),
    };

    mockContentPost = {
      type: "image",
      mode: "inception",
      theme: "Health Benefits",
      targetPlatform: "instagram",
      publishOrder: 1,
      creativeBrief: "Educational post",
      funwheelCTA: null,
    };
  });

  it("should generate Instagram post within 2200 char limit", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.character_count).toBeLessThanOrEqual(2200);
    expect(post.platform).toBe("instagram");
  });

  it("should generate LinkedIn post within 3000 char limit", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "linkedin"
    );

    expect(post.character_count).toBeLessThanOrEqual(3000);
    expect(post.platform).toBe("linkedin");
  });

  it("should generate 10-30 hashtags for Instagram", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.hashtag_count).toBeGreaterThanOrEqual(10);
    expect(post.hashtag_count).toBeLessThanOrEqual(30);
  });

  it("should generate 3-5 hashtags for LinkedIn", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "linkedin"
    );

    expect(post.hashtag_count).toBeGreaterThanOrEqual(3);
    expect(post.hashtag_count).toBeLessThanOrEqual(5);
  });

  it("should support inception mode", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.mode).toBe("inception");
  });

  it("should support atração-fatal mode", async () => {
    const atraoPost: ContentPost = {
      ...mockContentPost,
      mode: "atração-fatal",
      funwheelCTA: "Saiba mais",
    };

    const post = await service.generateStaticPost(
      atraoPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.mode).toBe("atração-fatal");
  });

  it("should include design note", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.design_note).toBeDefined();
    expect(post.design_note.length).toBeGreaterThan(0);
  });

  it("should include hashtags", async () => {
    const post = await service.generateStaticPost(
      mockContentPost,
      mockBrandProfile,
      "client-123",
      "instagram"
    );

    expect(post.hashtags.length).toBeGreaterThan(0);
    expect(post.hashtags[0]).toMatch(/^#/);
  });
});
