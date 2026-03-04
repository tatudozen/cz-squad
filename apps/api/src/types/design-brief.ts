export interface ColorSpec {
  hex: string;
  name: string;
  usage: string;
}

export interface TypographySpec {
  heading: {
    font: string;
    size: string;
    weight: string;
  };
  body: {
    font: string;
    size: string;
    weight: string;
  };
}

export interface DesignBrief {
  id?: string;
  content_id: string; // carousel_id or post_id
  content_type: 'carousel' | 'static_post';
  brand_profile_id: string;
  colors: ColorSpec[];
  typography: TypographySpec;
  layout_guide: string;
  imagery_style: string;
  spacing_guidelines: string;
  responsive_notes: string;
  per_slide_notes?: string[]; // for carousels
  overall_aesthetic: string;
  design_notes: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DesignBriefOptions {
  detailed?: boolean; // default true
  include_responsive?: boolean; // default true
}
