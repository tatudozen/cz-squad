// Deliverable Formatter Service
// Packages generated copy into deliverable formats (Instagram, LinkedIn, landing page)
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
export function formatInstagramCarousel(
  headline: string,
  subheadline: string,
  bodyText: string,
  cta: string,
  brandProfile: BrandProfile
): InstagramCarousel {
  // Split body text into carousel slides
  const slides = [];

  // Slide 1: Hook + Headline
  slides.push({
    slide: 1,
    caption: `🎯 ${headline}\n\n${subheadline}`,
    cta: 'Deslize →',
    hashtags: ['#transformação', '#saúde', '#bem-estar'],
  });

  // Slide 2: Main message
  const bodyLines = bodyText.split('\n').filter((line) => line.trim());
  const mainMessage = bodyLines.slice(0, 3).join('\n');
  slides.push({
    slide: 2,
    caption: `💡\n\n${mainMessage}`,
    cta: 'Continua →',
    hashtags: ['#dica', '#conhecimento'],
  });

  // Slide 3: Call to action
  slides.push({
    slide: 3,
    caption: `✨ Pronto para mudar?\n\n${cta}\n\nLink na bio!`,
    cta: 'Clique aqui',
    hashtags: ['#agora', '#oportunidade'],
  });

  return {
    slides,
    color_palette: {
      primary: brandProfile.color_palette.primary,
      secondary: brandProfile.color_palette.secondary,
      accent: brandProfile.color_palette.accent,
    },
    font_recommendations: brandProfile.font_recommendations || {
      heading: 'Montserrat',
      body: 'Inter',
    },
  };
}

/**
 * Format copy into LinkedIn posts
 */
export function formatLinkedInPosts(
  headline: string,
  subheadline: string,
  bodyText: string,
  cta: string
): LinkedInPost[] {
  return [
    {
      type: 'article',
      headline: `${headline} - Descubra como`,
      content: `${subheadline}\n\n${bodyText}\n\nA transformação começa com uma decisão. Você está pronto?`,
      cta,
      hashtags: ['#profissionalismo', '#inovação', '#crescimento', '#leadership'],
      emoji_style: 'minimal',
    },
    {
      type: 'short_form',
      headline: headline,
      content: `Quick tip: ${subheadline}\n\nA maioria das pessoas não consegue porque...\n\nMas você pode!\n\n${bodyText}`,
      cta,
      hashtags: ['#dica', '#carreira', '#desenvolvimento', '#sucesso'],
      emoji_style: 'moderate',
    },
    {
      type: 'carousel',
      headline: 'A Jornada da Transformação',
      content: `Slide 1: ${headline}\nSlide 2: ${subheadline}\nSlide 3: ${bodyText.substring(0, 200)}...`,
      cta,
      hashtags: ['#jornada', '#transformação', '#impacto'],
      emoji_style: 'moderate',
    },
  ];
}

/**
 * Format copy into landing page draft
 */
export function formatLandingPageDraft(
  headline: string,
  subheadline: string,
  bodyText: string,
  cta: string,
  brandProfile: BrandProfile,
  _briefing: Briefing
): LandingPageDraft {
  return {
    sections: {
      hero: {
        headline,
        subheadline,
      },
      value_proposition: {
        main_cta: cta,
        body_copy: bodyText,
      },
      social_proof: {
        testimonial_placeholder: `"${bodyText.substring(0, 100)}..." - Cliente satisfeito`,
        trust_indicators: [
          '✓ 20 anos de experiência',
          '✓ Mais de 1000 clientes atendidos',
          '✓ 95% de satisfação',
          '✓ Garantia de qualidade',
        ],
      },
    },
    color_scheme: {
      primary: brandProfile.color_palette.primary,
      secondary: brandProfile.color_palette.secondary,
      accent: brandProfile.color_palette.accent,
      neutral: brandProfile.color_palette.neutral,
    },
  };
}

/**
 * Package all copy into complete deliverable set
 */
export function packageDeliverables(
  headline: string,
  subheadline: string,
  bodyText: string,
  cta: string,
  socialPost: string,
  brandProfile: BrandProfile,
  briefing: Briefing
): DeliverablePackage {
  return {
    instagram_carousel: formatInstagramCarousel(
      headline,
      subheadline,
      bodyText,
      cta,
      brandProfile
    ),
    linkedin_posts: formatLinkedInPosts(headline, subheadline, bodyText, cta),
    landing_page_draft: formatLandingPageDraft(
      headline,
      subheadline,
      bodyText,
      cta,
      brandProfile,
      briefing
    ),
  };
}
