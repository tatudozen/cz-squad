/**
 * FunWheel Funnel System Types
 * Defines data structures for each stage of the sales funnel
 */

// Etapa A: Apresentação (Presentation/Landing Page)
export interface HeroSection {
  headline: string; // Max 100 chars
  subheadline: string; // Max 200 chars
  design_note: string;
}

export interface ProblemSection {
  title: string; // Max 80 chars
  description: string; // Max 500 chars
  pain_points: string[]; // Array of 3-5 pain points
}

export interface SolutionSection {
  title: string; // Max 80 chars
  description: string; // Max 500 chars
  approach: string; // Max 300 chars
}

export interface BenefitsSection {
  title: string; // Max 80 chars
  items: Array<{
    benefit: string; // Max 100 chars
    description: string; // Max 200 chars
  }>;
}

export interface ProofSocialSection {
  testimonials: Array<{
    quote: string; // Max 200 chars
    author: string;
    title: string;
  }>;
  results: string[]; // Array of 2-3 key results
  credentials: string[]; // Array of credentials/certifications
}

export interface CTASection {
  headline: string; // Max 100 chars
  button_text: string; // Max 40 chars
  target_url: string; // URL to Etapa R
}

export interface DesignBriefFunWheel {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  layout: string;
  imagery_style: string;
}

export interface Presentation {
  id: string;
  briefing_id: string;
  brand_profile_id: string;
  client_id: string;
  stage: 'presentation';
  hero: HeroSection;
  problem: ProblemSection;
  solution: SolutionSection;
  benefits: BenefitsSection;
  proof_social: ProofSocialSection;
  cta: CTASection;
  design_brief: DesignBriefFunWheel;
  created_at: string;
  updated_at: string;
}

export type GeneratePresentationRequest = Pick<
  Presentation,
  'briefing_id' | 'brand_profile_id' | 'client_id'
>;
