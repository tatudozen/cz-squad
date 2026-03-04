export interface StaticPost {
  id?: string;
  plan_item_id: string;
  brand_profile_id: string;
  client_id?: string;
  mode: 'inception' | 'atração-fatal';
  platform: 'instagram' | 'linkedin';
  main_text: string;
  hashtags: string[];
  design_note: string;
  character_count: number;
  hashtag_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StaticPostOptions {
  style?: 'educational' | 'promotional' | 'narrative';
}
