/**
 * Content Generation - TypeScript Interfaces
 * Defines all types used in the content strategy and generation pipeline
 */


/**
 * Content post type: carousel or static image
 */
export type PostType = 'carousel' | 'image';

/**
 * Content generation mode:
 * - inception: Branding/anticipation narrative with soft CTA
 * - atração-fatal: Urgency/curiosity narrative with FunWheel CTA
 */
export type ContentMode = 'inception' | 'atração-fatal';

/**
 * Target social media platform
 */
export type TargetPlatform = 'instagram' | 'linkedin';

/**
 * Content format preferences
 */
export type ContentFormat = 'carousel' | 'image' | 'mix';

/**
 * Single post in a content plan
 */
export interface ContentPlanPost {
  id: string; // UUID
  post_number: number; // 1-based order in plan
  type: PostType;
  mode: ContentMode;
  theme: string; // Content topic/angle
  target_platform: TargetPlatform;
  publish_order: number;
  creative_brief: string; // 2-3 line description of the concept
  funwheel_cta_included?: boolean; // Only for atração-fatal posts
}

/**
 * Options for content plan generation
 */
export interface ContentPlanOptions {
  total_posts: number; // Default: 10, Range: 1-50
  inception_ratio: number; // Default: 0.7 (70% inception, 30% atração-fatal)
  formats: ContentFormat; // Default: 'mix'
}

/**
 * Complete content plan for a briefing
 */
export interface ContentPlan {
  id: string; // UUID
  briefing_id: string; // UUID
  brand_profile_id: string; // UUID
  client_id: string; // UUID (for RLS)
  status: 'draft' | 'approved' | 'active';
  total_posts: number;
  inception_posts: number;
  atracaofatal_posts: number;
  posts: ContentPlanPost[];
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * Request payload for POST /content/plan
 */
export interface CreateContentPlanRequest {
  briefing_id: string;
  brand_profile_id: string;
  total_posts?: number;
  inception_ratio?: number;
  formats?: ContentFormat;
}

/**
 * Response structure for content plan operations
 */
export interface ContentPlanResponse extends ContentPlan {}
