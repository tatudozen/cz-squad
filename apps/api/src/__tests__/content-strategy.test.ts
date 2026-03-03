import { describe, it, expect, beforeEach } from "vitest";
import { ContentStrategyService } from "../services/content/strategy";
import { Briefing, BrandProfile } from "@copyzen/shared";

describe("ContentStrategyService", () => {
  let service: ContentStrategyService;
  let mockBriefing: Briefing;
  let mockBrandProfile: BrandProfile;

  beforeEach(() => {
    service = new ContentStrategyService();
    
    mockBriefing = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      client_id: "client-123",
      status: "approved",
      business_name: "Clínica Silva",
      segment: "healthcare",
      target_audience: "Médicos e pacientes com problemas de saúde",
      voice_tone: "professional",
      objectives: ["increase-leads", "build-awareness"],
      differentiators: "Abordagem humanizada e inovadora",
      existing_colors: ["#1E40AF", "#DC2626"],
      logo_url: "https://example.com/logo.png",
      created_at: new Date(),
      approved_at: new Date(),
    };

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
        tone: "professional, empathetic",
        keywords_to_use: ["saúde", "bem-estar", "solução", "confiança"],
        keywords_to_avoid: ["complexo", "técnico", "medicamentos"],
        example_phrases: ["A sua saúde em primeiro lugar", "Transformar vidas através da saúde"],
      },
      visual_style: "clean, modern, medical professional",
      font_recommendations: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
      created_at: new Date(),
    };
  });

  it("should create a content plan with default options", async () => {
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile);
    
    expect(plan).toBeDefined();
    expect(plan.total_posts).toBe(10);
    expect(plan.posts).toHaveLength(10);
    expect(plan.briefing_id).toBe(mockBriefing.id);
    expect(plan.brand_profile_id).toBe(mockBrandProfile.id);
  });

  it("should respect custom total_posts option", async () => {
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile, {
      totalPosts: 5,
    });
    
    expect(plan.total_posts).toBe(5);
    expect(plan.posts).toHaveLength(5);
  });

  it("should respect inception ratio distribution", async () => {
    const inceptionRatio = 0.7;
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile, {
      totalPosts: 10,
      inceptionRatio,
    });
    
    const inceptionCount = plan.posts.filter(p => p.mode === "inception").length;
    const expectedMin = Math.floor(10 * (inceptionRatio - 0.1));
    const expectedMax = Math.ceil(10 * (inceptionRatio + 0.1));
    
    expect(inceptionCount).toBeGreaterThanOrEqual(expectedMin);
    expect(inceptionCount).toBeLessThanOrEqual(expectedMax);
  });

  it("should ensure all atração-fatal posts have FunWheel CTA", async () => {
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile);
    
    const atraoFatalPosts = plan.posts.filter(p => p.mode === "atração-fatal");
    
    atraoFatalPosts.forEach(post => {
      expect(post.funwheelCTA).toBeDefined();
      expect(post.funwheelCTA).not.toBeNull();
      expect(post.funwheelCTA).not.toBe("");
    });
  });

  it("should have valid post structure", async () => {
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile);
    
    plan.posts.forEach(post => {
      expect(post.type).toMatch(/^(carousel|image)$/);
      expect(post.mode).toMatch(/^(inception|atração-fatal)$/);
      expect(post.theme).toBeDefined();
      expect(post.targetPlatform).toMatch(/^(instagram|linkedin)$/);
      expect(post.publishOrder).toBeGreaterThan(0);
      expect(post.creativeBrief).toBeDefined();
      expect(post.creativeBrief.length).toBeGreaterThan(0);
    });
  });

  it("should maintain unique publish orders", async () => {
    const plan = await service.createContentPlan(mockBriefing, mockBrandProfile);
    
    const publishOrders = plan.posts.map(p => p.publishOrder);
    const uniqueOrders = new Set(publishOrders);
    
    expect(uniqueOrders.size).toBe(publishOrders.length);
  });
});
