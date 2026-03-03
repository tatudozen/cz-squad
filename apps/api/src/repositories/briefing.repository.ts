import { Briefing } from "@copyzen/shared";
import { createClient } from "@supabase/supabase-js";
import { config } from "../utils/config.js";

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);

export class BriefingRepository {
  async findById(id: string): Promise<Briefing | null> {
    try {
      const { data, error } = await supabase
        .from("briefings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        client_id: data.client_id,
        status: data.status,
        business_name: data.business_name,
        segment: data.segment,
        target_audience: data.target_audience,
        voice_tone: data.voice_tone,
        objectives: data.objectives || [],
        differentiators: data.differentiators,
        monthly_budget: data.monthly_budget,
        existing_colors: data.existing_colors,
        logo_url: data.logo_url,
        created_at: new Date(data.created_at),
        approved_at: data.approved_at ? new Date(data.approved_at) : undefined,
        approved_by: data.approved_by,
      };
    } catch (error) {
      console.error("Error finding briefing:", error);
      return null;
    }
  }
}
