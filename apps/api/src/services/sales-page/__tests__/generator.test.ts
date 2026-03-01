/**
 * Tests for Sales Page Generator
 */

import { describe, it, expect } from 'vitest';
import {
  generateSalesPageContent,
  generateHeroSection,
  generateProblemSection,
  generateSolutionSection,
  generateBenefitsSection,
  generateProofSocialSection,
  generateOfferSection,
  generateGuaranteeSection,
  generateFAQSection,
  generateFinalCTASection,
} from '../generator.js';
import type { Briefing, BrandProfile } from '@copyzen/shared/supabase.js';
import type { OfferDetails } from '../../../types/sales-page.js';

const mockBriefing: Briefing = {
  id: 'briefing-123',
  clientId: 'client-123',
  status: 'approved',
  businessName: 'Test Business',
  segment: 'healthcare',
  targetAudience: 'medical professionals',
  voiceTone: 'conversational',
  objectives: ['increase-leads', 'build-authority'],
  differentiators: 'innovative approach',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockBrandProfile: BrandProfile = {
  id: 'brand-123',
  client_id: 'client-123',
  color_palette: {
    primary: '#0616CA',
    secondary: '#FF6B6B',
    accent: '#A1C8F7',
    neutral: '#F5F5F5',
  },
  font_recommendations: {
    heading: 'Poppins',
    body: 'Inter',
  },
  voice_guidelines: {
    tone: 'conversational',
    formality: 'casual',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

describe('Sales Page Generator', () => {
  describe('Section Generators', () => {
    it('should generate hero section with CTA', () => {
      const section = generateHeroSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toBeTruthy();
      expect(section.heading).toContain('Transforme sua');
      expect(section.cta_text).toBeTruthy();
      expect(section.cta_type).toBe('primary');
      expect(section.design_suggestion).toBeTruthy();
      expect(section.design_note).toBeTruthy();
    });

    it('should generate problem section with pain points', () => {
      const section = generateProblemSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('5 Sinais');
      expect(section.copy).toContain('❌');
      expect(section.copy.split('❌').length).toBeGreaterThan(3);
      expect(section.design_suggestion).toBeTruthy();
    });

    it('should generate solution section with 3 stages', () => {
      const section = generateSolutionSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('Sistema');
      expect(section.copy).toContain('Etapa 1');
      expect(section.copy).toContain('Etapa 2');
      expect(section.copy).toContain('Etapa 3');
      expect(section.design_suggestion).toBeTruthy();
    });

    it('should generate benefits section with 6 benefits', () => {
      const section = generateBenefitsSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('quando implementa');
      expect(section.copy).toContain('Economiza Tempo');
      expect(section.copy).toContain('Aumenta Conversão');
      expect(section.copy).toContain('Crescimento Escalável');
      expect(section.copy.split('####').length).toBeGreaterThan(5);
    });

    it('should generate proof social section with testimonials', () => {
      const section = generateProofSocialSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('clientes');
      expect(section.copy).toContain('>');
      expect(section.copy).toContain('3.5x');
      expect(section.design_suggestion).toBeTruthy();
    });

    it('should generate offer section with price', () => {
      const section = generateOfferSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('Investimento');
      expect(section.heading).toContain('BRL');
      expect(section.copy).toContain('✅');
      expect(section.design_suggestion).toContain('Checklist');
    });

    it('should generate offer section with custom packages', () => {
      const offerDetails: OfferDetails = {
        price: 1990,
        packages: [
          {
            name: 'Basic',
            price: 1990,
            features: ['Posts', 'Funnel'],
            is_recommended: false,
          },
          {
            name: 'Pro',
            price: 4990,
            features: ['Posts', 'Funnel', 'Sales Page'],
            is_recommended: true,
          },
        ],
      };

      const section = generateOfferSection(
        mockBriefing,
        mockBrandProfile,
        offerDetails
      );
      expect(section.copy).toContain('Planos Disponíveis');
      expect(section.copy).toContain('Basic');
      expect(section.copy).toContain('Pro');
      expect(section.copy).toContain('⭐ **Recomendado**');
    });

    it('should generate guarantee section with default days', () => {
      const section = generateGuaranteeSection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('Garantia');
      expect(section.heading).toContain('30');
      expect(section.copy).toContain('100%');
      expect(section.copy).toContain('devolvemos');
    });

    it('should generate guarantee section with custom guarantee', () => {
      const offerDetails: OfferDetails = {
        guarantee: {
          length_days: 60,
          description: 'Satisfação completa ou devolução',
        },
      };

      const section = generateGuaranteeSection(
        mockBriefing,
        mockBrandProfile,
        offerDetails
      );
      expect(section.heading).toContain('60');
    });

    it('should generate FAQ section with 5 questions', () => {
      const faqSections = generateFAQSection(mockBriefing, mockBrandProfile);
      expect(faqSections).toHaveLength(5);
      expect(faqSections[0]).toHaveProperty('question');
      expect(faqSections[0]).toHaveProperty('answer');
      expect(faqSections[0]).toHaveProperty('design_suggestion');
      expect(faqSections[0].question).toContain('resultado');
    });

    it('should generate final CTA section', () => {
      const section = generateFinalCTASection(mockBriefing, mockBrandProfile);
      expect(section.heading).toContain('pronto');
      expect(section.copy).toBeTruthy();
      expect(section.cta_text).toBe('Começar Agora');
      expect(section.cta_type).toBe('primary');
    });
  });

  describe('generateSalesPageContent()', () => {
    it('should generate complete sales page with all 9 sections', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      expect(page.id).toBeTruthy();
      expect(page.briefing_id).toBe('briefing-123');
      expect(page.brand_profile_id).toBe('brand-123');
      expect(page.client_id).toBe('client-123');

      // Check all 9 sections exist
      expect(page.sections.hero).toBeDefined();
      expect(page.sections.problem).toBeDefined();
      expect(page.sections.solution).toBeDefined();
      expect(page.sections.benefits).toBeDefined();
      expect(page.sections.proof_social).toBeDefined();
      expect(page.sections.offer).toBeDefined();
      expect(page.sections.guarantee).toBeDefined();
      expect(page.sections.faq).toBeDefined();
      expect(page.sections.final_cta).toBeDefined();
    });

    it('should calculate accurate word count', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      expect(page.metadata.total_words).toBeGreaterThan(500);
      expect(page.metadata.total_words).toBeLessThan(5000);
    });

    it('should calculate estimated read time', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      // At 200 words per minute, should be a reasonable read time
      expect(page.metadata.estimated_read_time_minutes).toBeGreaterThan(0);
      expect(page.metadata.estimated_read_time_minutes).toBeLessThan(30);
    });

    it('should count conversion elements', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      // Should have multiple CTAs, guarantee, etc
      expect(page.metadata.conversion_elements_count).toBeGreaterThan(0);
      expect(page.metadata.cta_count).toBeGreaterThanOrEqual(2);
    });

    it('should generate with custom offer details', async () => {
      const offerDetails: OfferDetails = {
        price: 5990,
        price_currency: 'BRL',
        packages: [
          {
            name: 'Premium',
            price: 5990,
            features: ['Everything'],
            is_recommended: true,
          },
        ],
        guarantee: {
          length_days: 60,
          description: 'Full satisfaction',
        },
        special_limited_offer: true,
      };

      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123',
        offerDetails
      );

      expect(page.sections.offer.copy).toContain('5990');
      expect(page.sections.guarantee.heading).toContain('60');
    });

    it('should have valid timestamps', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      expect(page.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(page.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include design suggestions for all sections', async () => {
      const page = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      Object.entries(page.sections).forEach(([_key, section]: any) => {
        if (Array.isArray(section)) {
          section.forEach((item: any) => {
            expect(item.design_suggestion).toBeTruthy();
            expect(item.design_note).toBeTruthy();
          });
        } else {
          expect(section.design_suggestion).toBeTruthy();
          expect(section.design_note).toBeTruthy();
        }
      });
    });

    it('should handle different briefing segments', async () => {
      const healthcareRef = await generateSalesPageContent(
        mockBriefing,
        mockBrandProfile,
        'client-123',
        'briefing-123',
        'brand-123'
      );

      expect(healthcareRef.sections.hero.heading).toContain('Transforme sua');
      expect(healthcareRef.id).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should generate CopyZen self-dogfooding page', async () => {
      const copyzenBriefing = {
        ...mockBriefing,
        businessName: 'CopyZen',
        segment: 'software',
        targetAudience: 'marketing agencies',
      } as any;

      const page = await generateSalesPageContent(
        copyzenBriefing,
        mockBrandProfile,
        'copyzen-client',
        'copyzen-briefing',
        'copyzen-brand'
      );

      expect(page.id).toBeTruthy();
      expect(page.sections.hero).toBeDefined();
      expect(page.sections.problem.copy).toContain('❌');
      expect(page.sections.offer.heading).toContain('BRL');
    });
  });
});
