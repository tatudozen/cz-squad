/**
 * Sales Page Types
 * Data structures for long-form sales page generation
 */

export interface Section {
  heading: string;
  copy: string; // Markdown-compatible
  design_suggestion: string; // Visual guidance for designer
  design_note: string; // Specific instructions
  cta_text?: string;
  cta_type?: 'primary' | 'secondary';
}

export interface FAQSection {
  question: string;
  answer: string;
  design_suggestion: string;
  design_note: string;
}

export interface OfferPackage {
  name: string;
  price: number;
  features: string[];
  is_recommended?: boolean;
}

export interface Guarantee {
  length_days: number;
  description: string;
}

export interface BonusItem {
  name: string;
  value: string;
}

export interface OfferDetails {
  price?: number;
  price_currency?: string; // Default: BRL
  packages?: OfferPackage[];
  guarantee?: Guarantee;
  bonuses?: BonusItem[];
  deadline?: string; // ISO8601 or "N days" format
  special_limited_offer?: boolean;
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
  updated_at: string;
}

export type GenerateSalesPageRequest = {
  briefing_id: string;
  brand_profile_id: string;
  client_id: string;
  offer_details?: OfferDetails;
};
