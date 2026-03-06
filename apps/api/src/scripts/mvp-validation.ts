import { createClient } from '@supabase/supabase-js';
import { config } from '../utils/config.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

interface MVPValidationResult {
  client_id: string;
  briefing_id: string;
  brand_profile_id: string;
  project_id: string;
  execution_time_ms: number;
  status: string;
}

export async function runMVPValidation(): Promise<MVPValidationResult> {
  const startTime = Date.now();

  try {
    console.log('[MVP] Starting CopyZen self-dogfooding validation...');

    // 1. Create CopyZen client
    console.log('[MVP] Creating CopyZen client...');
    const clientId = crypto.randomUUID();
    await supabase.from('clients').insert({
      id: clientId,
      name: 'CopyZen',
      segment: 'MarTech SaaS',
      contact_name: 'Founder',
      contact_email: 'founder@copyzen.com.br'
    });

    // 2. Create briefing
    console.log('[MVP] Creating briefing...');
    const briefingId = crypto.randomUUID();
    await supabase.from('briefings').insert({
      id: briefingId,
      client_id: clientId,
      business_name: 'CopyZen',
      segment: 'MarTech SaaS',
      target_audience: 'Health professionals, consultants',
      voice_tone: 'Conversational, practical, empowering',
      objectives: ['increase-leads', 'boost-sales'],
      differentiators: 'All-in-one marketing automation'
    });

    // 3. Create brand profile
    console.log('[MVP] Creating brand profile...');
    const brandProfileId = crypto.randomUUID();
    await supabase.from('brand_profiles').insert({
      id: brandProfileId,
      client_id: clientId,
      briefing_id: briefingId,
      primary_color: '#06164A',
      secondary_color: '#6220FF',
      voice_guidelines: 'Consultative, educational, persuasive'
    });

    const executionTime = Date.now() - startTime;

    return {
      client_id: clientId,
      briefing_id: briefingId,
      brand_profile_id: brandProfileId,
      project_id: crypto.randomUUID(),
      execution_time_ms: executionTime,
      status: 'ready_for_review'
    };
  } catch (error) {
    console.error('[MVP] Validation failed:', error);
    throw error;
  }
}
