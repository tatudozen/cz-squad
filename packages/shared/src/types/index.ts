// Core domain types for CopyZen
// Shared between frontend and backend

export interface Client {
  id: string;
  name: string;
  segment: string;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Briefing {
  id: string;
  client_id: string;
  status: 'draft' | 'approved' | 'processing' | 'completed';
  business_name: string;
  segment: string;
  target_audience: string;
  voice_tone: string;
  objectives: string[];
  differentiators: string;
  existing_colors?: string[];
  logo_url?: string;
  created_at: Date;
  approved_at?: Date;
  approved_by?: string;
}

export interface BrandProfile {
  id: string;
  client_id: string;
  briefing_id: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  voice_guidelines: {
    tone: string;
    keywords_to_use: string[];
    keywords_to_avoid: string[];
    example_phrases: string[];
  };
  visual_style: string;
  font_recommendations: {
    heading: string;
    body: string;
  };
  created_at: Date;
}

export interface Project {
  id: string;
  clientId: string;
  briefingId: string;
  status: 'pending' | 'generating' | 'ready_for_review' | 'approved' | 'delivered';
  contentPackageId?: string;
  funwheelId?: string;
  salesPageId?: string;
  startedAt: Date;
  completedAt?: Date;
  tokens?: {
    branding: number;
    content: number;
    funwheel: number;
    salesPage: number;
    total: number;
  };
  estimatedCost?: number;
}

export interface Lead {
  id: string;
  clientId: string;
  funnelId: string;
  name: string;
  email: string;
  phone: string;
  source: 'etapa_r' | 'etapa_t';
  status: 'captured' | 'qualified' | 'delivered_to_crm';
  qualificationScore?: number;
  qualificationTier?: 'hot' | 'warm' | 'cold';
  surveyResponses?: Record<string, any>;
  consentLGPD: boolean;
  consentAt: Date;
  createdAt: Date;
}

// API Request/Response types
export interface CreateBriefingRequest {
  clientId: string;
  businessName: string;
  segment: string;
  targetAudience: string;
  voiceTone: string;
  objectives: string[];
  differentiators: string;
}

export interface GenerateBrandProfileRequest {
  briefingId: string;
  clientId: string;
}

export interface CreateLeadRequest {
  funnelId: string;
  name: string;
  email: string;
  phone: string;
  consentLGPD: boolean;
}

export interface QualifyLeadRequest {
  surveyResponses: Record<string, any>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
