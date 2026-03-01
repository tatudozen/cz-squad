import { Briefing, BrandProfile } from '../supabase.js';
export interface DeliverablePackage {
    instagram_carousel: InstagramCarousel;
    linkedin_posts: LinkedInPost[];
    landing_page_draft: LandingPageDraft;
}
export interface InstagramCarousel {
    slides: {
        slide: number;
        caption: string;
        cta: string;
        hashtags: string[];
    }[];
    color_palette: {
        primary: string;
        secondary: string;
        accent: string;
    };
    font_recommendations: {
        heading: string;
        body: string;
    };
}
export interface LinkedInPost {
    type: 'article' | 'short_form' | 'carousel';
    headline: string;
    content: string;
    cta: string;
    hashtags: string[];
    emoji_style: 'minimal' | 'moderate' | 'emoji_heavy';
}
export interface LandingPageDraft {
    sections: {
        hero: {
            headline: string;
            subheadline: string;
        };
        value_proposition: {
            main_cta: string;
            body_copy: string;
        };
        social_proof: {
            testimonial_placeholder: string;
            trust_indicators: string[];
        };
    };
    color_scheme: {
        primary: string;
        secondary: string;
        accent: string;
        neutral: string;
    };
}
/**
 * Format copy into Instagram carousel captions
 */
export declare function formatInstagramCarousel(headline: string, subheadline: string, bodyText: string, cta: string, brandProfile: BrandProfile): InstagramCarousel;
/**
 * Format copy into LinkedIn posts
 */
export declare function formatLinkedInPosts(headline: string, subheadline: string, bodyText: string, cta: string): LinkedInPost[];
/**
 * Format copy into landing page draft
 */
export declare function formatLandingPageDraft(headline: string, subheadline: string, bodyText: string, cta: string, brandProfile: BrandProfile, _briefing: Briefing): LandingPageDraft;
/**
 * Package all copy into complete deliverable set
 */
export declare function packageDeliverables(headline: string, subheadline: string, bodyText: string, cta: string, socialPost: string, brandProfile: BrandProfile, briefing: Briefing): DeliverablePackage;
//# sourceMappingURL=deliverable-formatter.d.ts.map