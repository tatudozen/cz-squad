/**
 * Notification Service
 * Handles WhatsApp notifications via Evolution API
 */

import type { LeadEventData, QualificationTier } from '../../../types/funwheel.js.js';

export interface EvolutionApiConfig {
  apiUrl: string;
  apiKey: string;
  instanceId: string;
}

export interface EvolutionMessage {
  to: string;
  message: string;
  templateId?: string;
}

export interface EvolutionResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'error';
  error?: string;
}

/**
 * Evolution API client wrapper for WhatsApp messaging
 */
export class EvolutionClient {
  constructor(private config: EvolutionApiConfig) {}

  async sendMessage(phoneNumber: string, _message: string): Promise<EvolutionResponse> {
    try {
      // Validate phone format: (XX) 9XXXX-XXXX
      if (!/^\(\d{2}\)\s9\d{4,5}-\d{4}$/.test(phoneNumber)) {
        return {
          messageId: '',
          status: 'error',
          error: `Invalid phone format: ${phoneNumber}`,
        };
      }

      // Mock Evolution API call (real implementation would use HTTP)
      // Note: In production, cleanPhone = phoneNumber.replace(/\D/g, '') for Evolution API
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        messageId,
        status: 'queued', // Evolution typically queues initially
      };
    } catch (error) {
      return {
        messageId: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test if instance is connected and ready
   */
  async testConnection(): Promise<boolean> {
    try {
      // In production, would check Evolution API instance status
      // For MVP: always return true (instance is configured)
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Message template generator by qualification tier
 */
export function generateWhatsAppMessage(
  tier: QualificationTier,
  leadName: string,
  ctaLink: string
): string {
  const firstName = leadName.split(' ')[0];

  switch (tier) {
    case 'hot':
      return `🔥 Parabéns ${firstName}! Você está pronto para dar o próximo passo.\n\nClique aqui para agendar sua consulta: ${ctaLink}`;

    case 'warm':
      return `✨ Ótimo ter você aqui, ${firstName}! Aqui estão recursos para você explorar: ${ctaLink}`;

    case 'cold':
      return `👋 ${firstName}, seja bem-vindo! Enviaremos conteúdo educativo em breve:\n${ctaLink}`;

    default:
      return `Olá ${firstName}! ${ctaLink}`;
  }
}

/**
 * Send WhatsApp notification for lead event
 */
export async function sendLeadNotification(
  evolutionClient: EvolutionClient,
  leadData: LeadEventData,
  tier: QualificationTier
): Promise<EvolutionResponse> {
  const ctaLink = buildCtaLink(tier, leadData);
  const message = generateWhatsAppMessage(tier, leadData.lead_name, ctaLink);

  return evolutionClient.sendMessage(leadData.phone, message);
}

/**
 * Build CTA link based on qualification tier
 */
function buildCtaLink(tier: QualificationTier, leadData: LeadEventData): string {
  const baseUrl = process.env.PUBLIC_APP_URL || 'https://example.com';
  const params = new URLSearchParams({
    lead_id: leadData.campaign_id,
    tier,
  });

  switch (tier) {
    case 'hot':
      return `${baseUrl}/schedule?${params}`;
    case 'warm':
      return `${baseUrl}/resources?${params}`;
    case 'cold':
      return `${baseUrl}/learn?${params}`;
    default:
      return baseUrl;
  }
}

/**
 * Validate Evolution API configuration
 */
export function validateEvolutionConfig(config: EvolutionApiConfig): boolean {
  return !!(config.apiUrl && config.apiKey && config.instanceId);
}
