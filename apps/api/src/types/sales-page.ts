export interface OfferDetails {
  price?: number;
  price_currency?: string; // default: BRL
  packages?: Array<{
    name: string;
    price: number;
    features: string[];
    is_recommended?: boolean;
  }>;
  guarantee?: {
    length_days: number;
    description: string;
  };
  bonuses?: Array<{
    name: string;
    value: string;
  }>;
  deadline?: string; // ISO8601 or "N days" format
  special_limited_offer?: boolean;
}

export interface Section {
  heading: string;
  copy: string;
  design_suggestion: string;
  design_note: string;
  cta_text?: string;
  cta_type?: 'primary' | 'secondary';
}

export interface FAQSection {
  question: string;
  answer: string;
  heading?: string;
  copy?: string;
  design_suggestion?: string;
  design_note?: string;
}

export interface SalesPageSections {
  hero: Section;
  problem: Section;
  solution: Section;
  benefits: Section;
  proof_social: Section;
  offer: Section;
  guarantee: Section;
  faq: FAQSection[];
  final_cta: Section;
}

export interface SalesPageMetadata {
  total_words: number;
  estimated_read_time_minutes: number;
  conversion_elements_count: number;
  cta_count: number;
}

export interface SalesPageContent {
  id: string;
  briefing_id: string;
  brand_profile_id: string;
  client_id: string;
  sections: SalesPageSections;
  metadata: SalesPageMetadata;
  created_at: string;
}

export interface GenerateSalesPageRequest {
  briefing_id: string;
  brand_profile_id: string;
  offer_details?: OfferDetails;
}
