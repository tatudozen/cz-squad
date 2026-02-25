// Repository Pattern - Data Access Abstraction

import { supabaseAdmin, Client, Briefing, BrandProfile, ClientInputSchema, BriefingInputSchema } from '../supabase.js';

// =====================================================
// CLIENT REPOSITORY
// =====================================================

export class ClientRepository {
  static async create(data: unknown): Promise<Client> {
    const validated = ClientInputSchema.parse(data);
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert([validated])
      .select()
      .single();

    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return client;
  }

  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  }

  static async getAll(): Promise<Client[]> {
    const { data, error } = await supabaseAdmin.from('clients').select('*').order('created_at', {
      ascending: false,
    });

    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
    return data;
  }

  static async update(id: string, data: Partial<unknown>): Promise<Client> {
    const validated = ClientInputSchema.partial().parse(data);
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update client: ${error.message}`);
    return client;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete client: ${error.message}`);
  }
}

// =====================================================
// BRIEFING REPOSITORY
// =====================================================

export class BriefingRepository {
  static async create(data: unknown): Promise<Briefing> {
    const validated = BriefingInputSchema.parse(data);
    const { data: briefing, error } = await supabaseAdmin
      .from('briefings')
      .insert([{ ...validated, status: 'draft' }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create briefing: ${error.message}`);
    return briefing;
  }

  static async getById(id: string): Promise<Briefing | null> {
    const { data, error } = await supabaseAdmin
      .from('briefings')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getByClientId(clientId: string): Promise<Briefing[]> {
    const { data, error } = await supabaseAdmin
      .from('briefings')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch briefings: ${error.message}`);
    return data;
  }

  static async approve(id: string, approvedBy: string): Promise<Briefing> {
    const { data: briefing, error } = await supabaseAdmin
      .from('briefings')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve briefing: ${error.message}`);
    return briefing;
  }

  static async update(id: string, data: Partial<unknown>): Promise<Briefing> {
    const validated = BriefingInputSchema.partial().parse(data);
    const { data: briefing, error } = await supabaseAdmin
      .from('briefings')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update briefing: ${error.message}`);
    return briefing;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('briefings').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete briefing: ${error.message}`);
  }
}

// =====================================================
// BRAND PROFILE REPOSITORY
// =====================================================

export class BrandProfileRepository {
  static async create(data: unknown): Promise<BrandProfile> {
    const { data: profile, error } = await supabaseAdmin
      .from('brand_profiles')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(`Failed to create brand profile: ${error.message}`);
    return profile;
  }

  static async getById(id: string): Promise<BrandProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getByClientId(clientId: string): Promise<BrandProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('brand_profiles').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete brand profile: ${error.message}`);
  }
}

export default {
  ClientRepository,
  BriefingRepository,
  BrandProfileRepository,
};
