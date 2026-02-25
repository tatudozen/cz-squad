// Shared constants

export const BRIEFING_STATUSES = ['draft', 'approved', 'processing', 'completed'] as const;
export const LEAD_SOURCES = ['etapa_r', 'etapa_t'] as const;
export const LEAD_STATUSES = ['captured', 'qualified', 'delivered_to_crm'] as const;
export const QUALIFICATION_TIERS = ['hot', 'warm', 'cold'] as const;
export const PROJECT_STATUSES = [
  'pending',
  'generating',
  'ready_for_review',
  'approved',
  'delivered',
] as const;

export const COPYZEN_BRAND = {
  colors: {
    primary: '#06164A',
    secondary: '#6220FF',
    accent: '#ED145B',
    neutral: '#A1C8F7',
  },
  fonts: {
    heading: 'Muli',
    body: 'Lato',
  },
};
