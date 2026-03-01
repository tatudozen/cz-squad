/**
 * FunWheel Etapa R - Retention (Lead Capture)
 * Lead capture form with lead magnet (PDF)
 *
 * Story 3.2: FunWheel Etapa R - Retenção
 */

import { randomUUID } from 'crypto';
import { logger } from "../../../utils/logger.js";

export interface LeadData {
  presentation_id: string;
  brand_profile_id: string;
  name: string;
  email: string;
  phone: string;
  qualifier?: string;
}

export interface Lead {
  id: string;
  presentation_id: string;
  brand_profile_id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  qualifier?: string;
  lead_magnet_url: string;
  thank_you_page_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format phone number
 */
function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Generate lead magnet PDF (MVP: mock implementation)
 */
async function generateLeadMagnetPDF(presentationId: string): Promise<string> {
  // MVP: Return mock PDF URL
  // In production: Generate actual PDF from presentation content
  return `https://storage.example.com/lead-magnets/${presentationId}.pdf`;
}

/**
 * Capture lead from Etapa R form
 */
export async function captureLead(data: LeadData, clientId: string): Promise<Lead> {
  logger.info('Lead capture started', {
    email: data.email,
    presentation_id: data.presentation_id,
  });

  // Validation
  if (!validateEmail(data.email)) {
    throw new Error('Invalid email format');
  }

  const formattedPhone = formatPhone(data.phone);
  if (formattedPhone.length < 10) {
    throw new Error('Invalid phone number');
  }

  // Generate lead magnet PDF
  const leadMagnetUrl = await generateLeadMagnetPDF(data.presentation_id);

  // Create lead object
  const lead: Lead = {
    id: randomUUID(),
    presentation_id: data.presentation_id,
    brand_profile_id: data.brand_profile_id,
    client_id: clientId,
    name: data.name,
    email: data.email,
    phone: formattedPhone,
    qualifier: data.qualifier,
    lead_magnet_url: leadMagnetUrl,
    thank_you_page_url: `/funwheel/thank-you/${randomUUID()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Lead captured successfully', {
    lead_id: lead.id,
    email: lead.email,
  });

  return lead;
}
