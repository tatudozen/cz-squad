export interface CarouselSlide {
  slide_number: number;
  main_text: string;
  support_text?: string;
  design_note: string;
  is_cover: boolean;
  is_cta: boolean;
}

export interface Carousel {
  id?: string;
  plan_item_id: string;
  brand_profile_id: string;
  mode: 'inception' | 'atração-fatal';
  slides: CarouselSlide[];
  caption: string;
  design_brief: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CarouselOptions {
  slide_count?: number; // 4-8, default 6
  style?: 'educational' | 'promotional' | 'narrative';
}
