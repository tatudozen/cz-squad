import { Anthropic } from "@anthropic-ai/sdk";
import { BrandProfile } from "@copyzen/shared";
import { StaticPost, StaticPostOptions } from "../../types/static-post.js";

interface ContentPost {
  type: 'carousel' | 'image';
  mode: 'inception' | 'atração-fatal';
  theme: string;
  targetPlatform: 'instagram' | 'linkedin';
  publishOrder: number;
  creativeBrief: string;
  funwheelCTA: string | null;
}

export class StaticPostCopyGeneratorService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  private getPlatformConstraints(platform: 'instagram' | 'linkedin') {
    return {
      instagram: {
        maxChars: 2200,
        minHashtags: 10,
        maxHashtags: 30,
        tone: "engaging, visual, storytelling",
      },
      linkedin: {
        maxChars: 3000,
        minHashtags: 3,
        maxHashtags: 5,
        tone: "professional, thoughtful, B2B-focused",
      },
    }[platform];
  }

  async generateStaticPost(
    contentPost: ContentPost,
    brandProfile: BrandProfile,
    clientId: string,
    platform: 'instagram' | 'linkedin',
    options: StaticPostOptions = {}
  ): Promise<StaticPost> {
    const constraints = this.getPlatformConstraints(platform);
    const style = options.style || "narrative";
    const mode = contentPost.mode;

    const voiceGuidelines = typeof brandProfile.voice_guidelines === 'string'
      ? brandProfile.voice_guidelines
      : (brandProfile.voice_guidelines as any)?.tone || "professional";

    const prompt = `You are an expert ${platform} copywriter specializing in conversational marketing.

Generate a complete static post for ${platform} about: ${contentPost.theme}

## Content Brief
- Theme: ${contentPost.theme}
- Mode: ${mode}
- Style: ${style}
- Brand Voice: ${voiceGuidelines}

## Platform Requirements
- Platform: ${platform}
- Maximum characters: ${constraints.maxChars}
- Hashtags: ${constraints.minHashtags}-${constraints.maxHashtags}
- Tone: ${constraints.tone}

## Mode Requirements
${mode === 'inception' ? `- **Inception Mode:** Educational focus, soft CTA (follow, connect, learn more)
- Build trust and authority
- Anticipate interest` : `- **Atração Fatal Mode:** Create urgency and curiosity
- Direct CTA to FunWheel link
- Drive immediate engagement`}

## Output Format
Generate EXACTLY a JSON object (no markdown, no extra text):
{
  "main_text": "complete post copy",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "design_note": "visual suggestion for the single image"
}

## Constraints
- main_text must be ≤ ${constraints.maxChars} characters
- Include ${constraints.minHashtags}-${constraints.maxHashtags} hashtags
- Design note should be 1-2 sentences describing the visual
- Adapt tone to platform conventions
- ${mode === 'inception' ? 'Soft CTA only - no aggressive selling' : 'Strong CTA directing to FunWheel'}

Return ONLY the JSON object.`;

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
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

    let postData: { main_text: string; hashtags: string[]; design_note: string };
    try {
      postData = JSON.parse(content.text);
    } catch (error) {
      throw new Error(`Failed to parse Claude response as JSON: ${error}`);
    }

    // Validate character limit
    if (postData.main_text.length > constraints.maxChars) {
      throw new Error(
        `Main text exceeds ${constraints.maxChars} chars: ${postData.main_text.length}`
      );
    }

    // Validate hashtag count
    if (
      postData.hashtags.length < constraints.minHashtags ||
      postData.hashtags.length > constraints.maxHashtags
    ) {
      throw new Error(
        `Hashtag count must be ${constraints.minHashtags}-${constraints.maxHashtags}, got ${postData.hashtags.length}`
      );
    }

    return {
      plan_item_id: contentPost.theme,
      brand_profile_id: brandProfile.id!,
      client_id: clientId,
      mode,
      platform,
      main_text: postData.main_text,
      hashtags: postData.hashtags,
      design_note: postData.design_note,
      character_count: postData.main_text.length,
      hashtag_count: postData.hashtags.length,
      created_at: new Date(),
    };
  }
}
