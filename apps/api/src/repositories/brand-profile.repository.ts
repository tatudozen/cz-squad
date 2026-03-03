import { BrandProfile } from "@copyzen/shared";
import { createClient } from "@supabase/supabase-js";
import { config } from "../utils/config.js";

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);

export class BrandProfileRepository {
  async findById(id: string): Promise<BrandProfile | null> {
    try {
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        client_id: data.client_id,
        briefing_id: data.briefing_id,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        color_palette: data.color_palette || {
          primary: "#000000",
          secondary: "#FFFFFF",
          accent: "#808080",
          neutral: "#F0F0F0",
        },
        voice_guidelines: data.voice_guidelines || "",
        visual_style: data.visual_style || "",
        font_recommendations: data.font_recommendations || {
          heading: "sans-serif",
          body: "sans-serif",
        },
        brand_values: data.brand_values,
        created_at: new Date(data.created_at),
      };
    } catch (error) {
      console.error("Error finding brand profile:", error);
      return null;
    }
  }
}
