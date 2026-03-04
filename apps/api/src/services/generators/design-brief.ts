import { Anthropic } from "@anthropic-ai/sdk";
import { BrandProfile } from "@copyzen/shared";
import { DesignBrief, DesignBriefOptions } from "../../types/design-brief.js";

interface Carousel {
  plan_item_id: string;
  brand_profile_id: string;
  mode: 'inception' | 'atração-fatal';
  slides: Array<{
    slide_number: number;
    main_text: string;
    support_text?: string;
    design_note: string;
    is_cover: boolean;
    is_cta: boolean;
  }>;
  caption: string;
  design_brief: string;
  created_at?: Date;
}

interface StaticPost {
  plan_item_id: string;
  brand_profile_id: string;
  client_id?: string;
  mode: 'inception' | 'atração-fatal';
  platform: 'instagram' | 'linkedin';
  main_text: string;
  hashtags: string[];
  design_note: string;
  character_count: number;
  hashtag_count: number;
  created_at?: Date;
}

export class DesignBriefGeneratorService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async generateCarouselDesignBrief(
    carousel: Carousel,
    brandProfile: BrandProfile,
    clientId: string,
    options: DesignBriefOptions = {}
  ): Promise<DesignBrief> {
    const detailed = options.detailed !== false;
    const includeResponsive = options.include_responsive !== false;

    const colorPalette = brandProfile.color_palette;
    const prompt = `You are a visual design strategist specializing in Instagram carousel design.

Generate a detailed visual design brief for an Instagram carousel with ${carousel.slides.length} slides.

## Brand Profile
- Primary Color: ${colorPalette.primary}
- Secondary Color: ${colorPalette.secondary}
- Accent Color: ${colorPalette.accent}
- Neutral Color: ${colorPalette.neutral}
- Visual Style: ${brandProfile.visual_style}

## Carousel Overview
- Mode: ${carousel.mode}
- Total Slides: ${carousel.slides.length}
- Design Brief: ${carousel.design_brief}

## Carousel Slides
${carousel.slides.map(s => `- Slide ${s.slide_number}: "${s.main_text.substring(0, 50)}..." (${s.is_cover ? 'COVER' : s.is_cta ? 'CTA' : 'CONTENT'})`).join('\n')}

Generate a comprehensive design brief in JSON format:
{
  "colors": [
    {"hex": "#...", "name": "color_name", "usage": "where to use"},
    ...
  ],
  "typography": {
    "heading": {"font": "font-name", "size": "px", "weight": "number"},
    "body": {"font": "font-name", "size": "px", "weight": "number"}
  },
  "layout_guide": "2-3 sentence layout recommendations",
  "imagery_style": "visual tone and mood description",
  "spacing_guidelines": "margin/padding recommendations",
  "responsive_notes": "mobile and desktop considerations",
  "per_slide_notes": ["slide 1 visual note", "slide 2 visual note", ...],
  "overall_aesthetic": "overall visual direction",
  "design_notes": "3-4 key design principles"
}

Return ONLY the JSON object.`;

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    let briefData;
    try {
      briefData = JSON.parse(content.text);
    } catch (error) {
      throw new Error(`Failed to parse design brief JSON: ${error}`);
    }

    return {
      content_id: carousel.plan_item_id,
      content_type: 'carousel',
      brand_profile_id: brandProfile.id!,
      colors: briefData.colors || [],
      typography: briefData.typography,
      layout_guide: briefData.layout_guide,
      imagery_style: briefData.imagery_style,
      spacing_guidelines: briefData.spacing_guidelines,
      responsive_notes: briefData.responsive_notes,
      per_slide_notes: briefData.per_slide_notes,
      overall_aesthetic: briefData.overall_aesthetic,
      design_notes: briefData.design_notes,
      created_at: new Date(),
    };
  }

  async generateStaticPostDesignBrief(
    post: StaticPost,
    brandProfile: BrandProfile,
    clientId: string,
    options: DesignBriefOptions = {}
  ): Promise<DesignBrief> {
    const colorPalette = brandProfile.color_palette;
    const prompt = `You are a visual design strategist for ${post.platform === 'instagram' ? 'Instagram' : 'LinkedIn'} posts.

Generate a detailed visual design brief for a ${post.platform} static post.

## Brand Profile
- Primary Color: ${colorPalette.primary}
- Secondary Color: ${colorPalette.secondary}
- Accent Color: ${colorPalette.accent}
- Visual Style: ${brandProfile.visual_style}

## Post Overview
- Platform: ${post.platform}
- Mode: ${post.mode}
- Copy Preview: "${post.main_text.substring(0, 100)}..."

Generate a comprehensive design brief in JSON format:
{
  "colors": [
    {"hex": "#...", "name": "color_name", "usage": "where to use"},
    ...
  ],
  "typography": {
    "heading": {"font": "font-name", "size": "px", "weight": "number"},
    "body": {"font": "font-name", "size": "px", "weight": "number"}
  },
  "layout_guide": "layout recommendations",
  "imagery_style": "visual mood description",
  "spacing_guidelines": "spacing recommendations",
  "responsive_notes": "mobile considerations",
  "overall_aesthetic": "visual direction",
  "design_notes": "key design principles"
}

Return ONLY the JSON object.`;

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    let briefData;
    try {
      briefData = JSON.parse(content.text);
    } catch (error) {
      throw new Error(`Failed to parse design brief JSON: ${error}`);
    }

    return {
      content_id: post.plan_item_id,
      content_type: 'static_post',
      brand_profile_id: brandProfile.id!,
      colors: briefData.colors || [],
      typography: briefData.typography,
      layout_guide: briefData.layout_guide,
      imagery_style: briefData.imagery_style,
      spacing_guidelines: briefData.spacing_guidelines,
      responsive_notes: briefData.responsive_notes,
      overall_aesthetic: briefData.overall_aesthetic,
      design_notes: briefData.design_notes,
      created_at: new Date(),
    };
  }
}
