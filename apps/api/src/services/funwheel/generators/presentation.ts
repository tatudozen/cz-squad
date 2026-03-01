/**
 * Presentation Service (FunWheel Etapa A)
 * Generates transformation narrative landing pages
 */

import { BrandProfile, Briefing } from '@copyzen/shared/supabase.js';
import type {
  Presentation,
  HeroSection,
  ProblemSection,
  SolutionSection,
  BenefitsSection,
  ProofSocialSection,
  CTASection,
  DesignBriefFunWheel,
} from '../../../types/funwheel.js';

/**
 * Generate a transformation narrative landing page (Etapa A)
 */
export async function generatePresentation(
  briefing: Briefing,
  brandProfile: BrandProfile,
  clientId: string,
  briefingId: string,
  brandProfileId: string
): Promise<Presentation> {
  const startTime = performance.now();

  try {
    // eslint-disable-next-line no-console
    console.log(`[PRESENTATION_GENERATION_STARTED] briefing_id=${briefingId}`);

    // Generate narrative sections
    const hero = generateHeroSection(briefing, brandProfile);
    const problem = generateProblemSection(briefing, brandProfile);
    const solution = generateSolutionSection(briefing, brandProfile);
    const benefits = generateBenefitsSection(briefing, brandProfile);
    const proofSocial = generateProofSocialSection(briefing, brandProfile);
    const cta = generateCTASection(briefing);
    const designBrief = generateDesignBrief(brandProfile);

    const endTime = performance.now();
    const timeMs = Math.ceil(endTime - startTime);

    const presentation: Presentation = {
      id: crypto.randomUUID(),
      briefing_id: briefingId,
      brand_profile_id: brandProfileId,
      client_id: clientId,
      stage: 'presentation',
      hero,
      problem,
      solution,
      benefits,
      proof_social: proofSocial,
      cta,
      design_brief: designBrief,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line no-console
    console.log(`[PRESENTATION_GENERATED] id=${presentation.id} time_ms=${timeMs}`);
    return presentation;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('[PRESENTATION_GENERATION_ERROR]', errorMessage);
    throw error;
  }
}

function generateHeroSection(briefing: Briefing, brandProfile: BrandProfile): HeroSection {
  const headlines = [
    `Transform ${briefing.target_audience} with ${briefing.business_name}`,
    `From Problem to Solution: The ${briefing.business_name} Method`,
    `Discover How ${briefing.target_audience} Achieve Their Goals`,
  ];

  const subheadlines = [
    `${brandProfile.voice_guidelines.tone} approach to ${briefing.objectives[0]}`,
    `Join thousands who've transformed their ${briefing.segment}`,
    `Your path to ${briefing.objectives[0]} starts here`,
  ];

  return {
    headline: headlines[Math.floor(Math.random() * headlines.length)],
    subheadline: subheadlines[Math.floor(Math.random() * subheadlines.length)],
    design_note: '🎯 Full-width hero with compelling imagery and gradient overlay',
  };
}

function generateProblemSection(briefing: Briefing, _brandProfile: BrandProfile): ProblemSection {
  const painPoints = [
    `Many ${briefing.target_audience} struggle with lack of direction`,
    `Without proper guidance, results take much longer`,
    `Trial and error wastes time and resources`,
    `Uncertainty prevents taking the first step`,
    `Generic solutions don't address specific needs`,
  ];

  return {
    title: 'The Challenge',
    description: `For ${briefing.target_audience}, achieving ${briefing.objectives[0]} is harder than it seems. The problem isn't lack of effort—it's lack of the right approach. Without expert guidance, progress stalls.`,
    pain_points: painPoints.slice(0, 4),
  };
}

function generateSolutionSection(briefing: Briefing, brandProfile: BrandProfile): SolutionSection {
  return {
    title: 'The Solution',
    description: `${briefing.business_name} provides a proven, systematic approach to ${briefing.objectives[0]}. Our methodology combines ${brandProfile.voice_guidelines.tone} principles with ${briefing.differentiators}.`,
    approach: `We guide ${briefing.target_audience} through a structured process: assessment, personalization, implementation, and optimization. Results show up fast.`,
  };
}

function generateBenefitsSection(_briefing: Briefing, _brandProfile: BrandProfile): BenefitsSection {
  const benefits = [
    {
      benefit: 'Faster Results',
      description: 'Achieve your goals in half the time with our proven system',
    },
    {
      benefit: 'Expert Guidance',
      description: 'Benefit from decades of combined experience',
    },
    {
      benefit: 'Personalized Approach',
      description: 'Solutions tailored to your specific needs',
    },
    {
      benefit: 'Ongoing Support',
      description: 'We are with you every step of the journey',
    },
  ];

  return {
    title: 'What You Will Achieve',
    items: benefits,
  };
}

function generateProofSocialSection(_briefing: Briefing, _brandProfile: BrandProfile): ProofSocialSection {
  return {
    testimonials: [
      {
        quote: 'This approach changed everything for us. Results were immediate and exceeded expectations.',
        author: 'Sarah M.',
        title: 'Business Owner',
      },
      {
        quote: 'Finally, someone who understands our specific challenges. Highly recommend.',
        author: 'John D.',
        title: 'Operations Manager',
      },
      {
        quote: 'Best investment we could have made. ROI is clear within weeks.',
        author: 'Emma L.',
        title: 'Team Lead',
      },
    ],
    results: [
      '95% of clients see results within 30 days',
      'Average improvement of 40% in key metrics',
      '500+ satisfied clients across industries',
    ],
    credentials: [
      'Industry-certified methodology',
      'Featured in major publications',
      'Award-winning approach',
    ],
  };
}

function generateCTASection(briefing: Briefing): CTASection {
  return {
    headline: `Ready to Transform Your ${briefing.segment}?`,
    button_text: 'Start Your Journey',
    target_url: '/funwheel/retention',
  };
}

function generateDesignBrief(brandProfile: BrandProfile): DesignBriefFunWheel {
  return {
    colors: {
      primary: brandProfile.color_palette.primary,
      secondary: brandProfile.color_palette.secondary,
      accent: brandProfile.color_palette.accent,
    },
    typography: {
      heading: brandProfile.font_recommendations?.heading || 'Bold Sans-Serif, 32-48px',
      body: brandProfile.font_recommendations?.body || 'Regular Sans-Serif, 16-18px',
    },
    layout: 'Single-column, scrollable sections with clear visual hierarchy',
    imagery_style:
      'Professional, aspirational photography with subtle brand color overlays',
  };
}
