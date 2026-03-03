import { Anthropic } from "@anthropic-ai/sdk";
import { ContentPlan, ContentPost, Briefing, BrandProfile } from "@copyzen/shared";

export interface ContentStrategyOptions {
  totalPosts?: number;
  inceptionRatio?: number;
  formats?: "carousel" | "image" | "mix";
}

export class ContentStrategyService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async createContentPlan(
    briefing: Briefing,
    brandProfile: BrandProfile,
    options: ContentStrategyOptions = {}
  ): Promise<ContentPlan> {
    const totalPosts = options.totalPosts || 10;
    const inceptionRatio = options.inceptionRatio || 0.7;
    const formats = options.formats || "mix";

    const inceptionCount = Math.round(totalPosts * inceptionRatio);
    const atraoFatalCount = totalPosts - inceptionCount;

    const voiceGuidelinesText = typeof brandProfile.voice_guidelines === 'string'
      ? brandProfile.voice_guidelines
      : brandProfile.voice_guidelines?.tone || "professional";

    const prompt = `You are a content strategist expert in conversational marketing.

Given the following client briefing and brand profile, generate a comprehensive content plan for ${totalPosts} social media posts.

## Client Briefing
- Business: ${briefing.business_name}
- Segment: ${briefing.segment}
- Target Audience: ${briefing.target_audience}
- Voice Tone: ${briefing.voice_tone}
- Objectives: ${briefing.objectives.join(", ")}
- Differentiators: ${briefing.differentiators}

## Brand Profile
- Primary Color: ${brandProfile.color_palette?.primary || "#000000"}
- Secondary Color: ${brandProfile.color_palette?.secondary || "#FFFFFF"}
- Voice Guidelines: ${voiceGuidelinesText}
- Visual Style: ${brandProfile.visual_style || "modern"}

## Content Plan Requirements
- Total Posts: ${totalPosts}
- Distribution: ${inceptionCount} Inception posts (${Math.round(inceptionRatio * 100)}%) + ${atraoFatalCount} Atração Fatal posts
- Formats: Mix of carousel and image posts
- Key Requirement: Every "Atração Fatal" post MUST include a FunWheel CTA

Generate a detailed JSON array with the following structure for each post:
[
  {
    "type": "carousel" or "image",
    "mode": "inception" or "atração-fatal",
    "theme": "specific theme/topic",
    "targetPlatform": "instagram" or "linkedin",
    "publishOrder": 1,
    "creativeBrief": "2-3 line description of content",
    "funwheelCTA": "CTA text if atração-fatal, null otherwise"
  }
]

Ensure:
1. Carousel posts have engaging multi-slide structure potential
2. Image posts are single-image Instagram-friendly
3. Theme variety and coherence with client's objectives
4. All "atração-fatal" posts include compelling FunWheel CTA
5. Distribution respects the ${inceptionRatio * 100}% Inception / ${(1 - inceptionRatio) * 100}% Atração Fatal split
6. Posting order follows strategic progression

Return ONLY the JSON array, no markdown or additional text.`;

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    let posts: ContentPost[];
    try {
      posts = JSON.parse(content.text);
    } catch (error) {
      throw new Error(`Failed to parse Claude response as JSON: ${error}`);
    }

    // Validate the response
    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Claude response is not a valid array of posts");
    }

    // Verify Atração Fatal posts have FunWheel CTA
    const invalidAtraoFatalPosts = posts.filter(
      (post) => post.mode === "atração-fatal" && !post.funwheelCTA
    );
    if (invalidAtraoFatalPosts.length > 0) {
      throw new Error(
        `Invalid content plan: ${invalidAtraoFatalPosts.length} Atração Fatal posts missing FunWheel CTA`
      );
    }

    // Verify distribution ratio
    const actualInceptionCount = posts.filter(
      (post) => post.mode === "inception"
    ).length;
    const expectedInceptionMin = Math.floor(totalPosts * (inceptionRatio - 0.1));
    const expectedInceptionMax = Math.ceil(totalPosts * (inceptionRatio + 0.1));

    if (
      actualInceptionCount < expectedInceptionMin ||
      actualInceptionCount > expectedInceptionMax
    ) {
      throw new Error(
        `Invalid content distribution: Expected ~${inceptionCount} Inception posts, got ${actualInceptionCount}`
      );
    }

    return {
      briefing_id: briefing.id!,
      brand_profile_id: brandProfile.id!,
      total_posts: totalPosts,
      inception_count: actualInceptionCount,
      atrao_fatal_count: totalPosts - actualInceptionCount,
      posts: posts,
      created_at: new Date(),
      metadata: {
        inceptionRatio,
        formats,
      },
    } as ContentPlan;
  }
}
