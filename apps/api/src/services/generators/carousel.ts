import { Anthropic } from "@anthropic-ai/sdk";
import { BrandProfile } from "@copyzen/shared";
import { Carousel, CarouselSlide, CarouselOptions } from "../../types/carousel.js";

// ContentPost inline interface
interface ContentPost {
  type: 'carousel' | 'image';
  mode: 'inception' | 'atração-fatal';
  theme: string;
  targetPlatform: 'instagram' | 'linkedin';
  publishOrder: number;
  creativeBrief: string;
  funwheelCTA: string | null;
}

export class CarouselCopyGeneratorService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async generateCarousel(
    contentPost: ContentPost,
    brandProfile: BrandProfile,
    clientId: string,
    options: CarouselOptions = {}
  ): Promise<Carousel> {
    const slideCount = Math.min(Math.max(options.slide_count || 6, 4), 8);
    const style = options.style || "narrative";
    const mode = contentPost.mode;

    const voiceGuidelines = typeof brandProfile.voice_guidelines === 'string'
      ? brandProfile.voice_guidelines
      : (brandProfile.voice_guidelines as any)?.tone || "professional";

    const prompt = `You are an expert Instagram carousel copy writer specializing in conversational marketing.

Generate a complete carousel post with ${slideCount} slides for Instagram. The carousel should be in "${mode}" mode.

## Content Brief
- Theme: ${contentPost.theme}
- Mode: ${mode}
- Style: ${style}
- Brand Voice: ${voiceGuidelines}
- Target Platform: ${contentPost.targetPlatform}

## Carousel Requirements
${mode === 'inception' ? `- **Inception Mode:** Focus on education and brand building
- CTA should be soft (follow, save, share)
- Build anticipation and trust` : `- **Atração Fatal Mode:** Create urgency and curiosity
- CTA should direct to FunWheel landing page
- Drive immediate action`}

## Output Format
Generate EXACTLY a JSON object (no markdown, no extra text) with this structure:
{
  "slides": [
    {
      "slide_number": 1,
      "main_text": "headline or main message (max 150 chars)",
      "support_text": "optional supporting text (max 100 chars)",
      "design_note": "visual suggestion (e.g., 'Bold text on gradient background')",
      "is_cover": true/false,
      "is_cta": false
    }
  ],
  "caption": "Instagram caption with 5-8 hashtags",
  "design_brief": "2-3 sentence overall visual direction"
}

## Constraints
- Cover slide MUST be first (is_cover: true)
- CTA slide MUST be last (is_cta: true)
- Each main_text: max 150 characters
- Each support_text: max 100 characters
- Total slides: exactly ${slideCount}
- Logical progression from cover → content → CTA
- Caption includes relevant hashtags

Return ONLY the JSON object.`;

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

    let carouselData: { slides: CarouselSlide[]; caption: string; design_brief: string };
    try {
      carouselData = JSON.parse(content.text);
    } catch (error) {
      throw new Error(`Failed to parse Claude response as JSON: ${error}`);
    }

    // Validate structure
    if (!Array.isArray(carouselData.slides) || carouselData.slides.length === 0) {
      throw new Error("Invalid carousel data: no slides");
    }

    // Validate slide count
    if (carouselData.slides.length !== slideCount) {
      throw new Error(`Expected ${slideCount} slides, got ${carouselData.slides.length}`);
    }

    // Validate character limits
    carouselData.slides.forEach((slide, idx) => {
      if (slide.main_text.length > 150) {
        throw new Error(`Slide ${idx + 1} main_text exceeds 150 chars: ${slide.main_text.length}`);
      }
      if (slide.support_text && slide.support_text.length > 100) {
        throw new Error(`Slide ${idx + 1} support_text exceeds 100 chars: ${slide.support_text.length}`);
      }
    });

    // Validate cover slide
    if (!carouselData.slides[0].is_cover) {
      throw new Error("First slide must be cover slide (is_cover: true)");
    }

    // Validate CTA slide
    if (!carouselData.slides[carouselData.slides.length - 1].is_cta) {
      throw new Error("Last slide must be CTA slide (is_cta: true)");
    }

    return {
      plan_item_id: contentPost.theme, // Using theme as plan_item_id for now
      brand_profile_id: brandProfile.id!,
      mode,
      slides: carouselData.slides,
      caption: carouselData.caption,
      design_brief: carouselData.design_brief,
      created_at: new Date(),
    };
  }
}
