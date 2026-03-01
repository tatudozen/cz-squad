/**
 * Tests for Sales Page Builder
 */

import { describe, it, expect } from 'vitest';
import { buildSalesPage, deploySalesPageToVPS } from '../builder.js';
import type { SalesPageContent } from '../../../types/sales-page.js';
import type { BrandProfile } from '@shared/supabase.js';

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

const mockSalesPageContent: SalesPageContent = {
  id: 'sales-page-123',
  briefing_id: 'briefing-123',
  brand_profile_id: 'brand-123',
  client_id: 'client-123',
  sections: {
    hero: {
      heading: 'Transforme sua saúde',
      copy: 'Com a melhor solução do mercado',
      design_suggestion: 'Hero com gradiente',
      design_note: 'Fundo em gradiente do primário para accent',
      cta_text: 'Começar Agora',
      cta_type: 'primary',
    },
    problem: {
      heading: '5 Sinais de que você precisa',
      copy: '❌ Cansaço constante\n❌ Falta de foco\n❌ Saúde comprometida',
      design_suggestion: 'Ícones com checkmarks',
      design_note: 'Usar cores vibrantes para pain points',
    },
    solution: {
      heading: 'Sistema em 3 Etapas',
      copy: 'Etapa 1: Avaliar\nEtapa 2: Planejar\nEtapa 3: Executar',
      design_suggestion: 'Timeline horizontal',
      design_note: 'Mostrar progresso visual',
    },
    benefits: {
      heading: 'Resultados quando implementa',
      copy: '#### Economiza Tempo\n#### Aumenta Conversão\n#### Crescimento Escalável',
      design_suggestion: 'Cards em grid',
      design_note: 'Destaque do primário nas titles',
    },
    proof_social: {
      heading: 'Clientes satisfeitos',
      copy: '> Cliente 1: Excelente resultado\n> Cliente 2: 3.5x de retorno',
      design_suggestion: 'Depoimentos em cards',
      design_note: 'Bordas coloridas com primária',
    },
    offer: {
      heading: 'Investimento BRL 2990',
      copy: '✅ Inclui tudo\n✅ Acesso vitalício',
      design_suggestion: 'Checklist com cores',
      design_note: 'Realce em accent para valor',
      cta_text: 'Garantir Acesso',
      cta_type: 'primary',
    },
    guarantee: {
      heading: 'Garantia 30 dias',
      copy: 'Se não gostar, devolvemos 100%',
      design_suggestion: 'Badge com checkmark',
      design_note: 'Posicionado antes da CTA final',
    },
    faq: [
      {
        question: 'Quanto tempo para resultado?',
        answer: '30 dias de implementação',
        design_suggestion: 'Accordion expandível',
        design_note: 'Ícone de mais/menos',
      },
      {
        question: 'Funciona para meu negócio?',
        answer: 'Sim, para qualquer segmento',
        design_suggestion: 'Fundo branco',
        design_note: 'Texto em primária',
      },
    ],
    final_cta: {
      heading: 'Pronto para começar?',
      copy: 'Clique abaixo e inicie sua jornada',
      design_suggestion: 'CTA grande e destacado',
      design_note: 'Urgência com countdown',
      cta_text: 'Começar Agora',
      cta_type: 'primary',
    },
  },
  metadata: {
    total_words: 850,
    estimated_read_time_minutes: 4,
    conversion_elements_count: 5,
    cta_count: 3,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Sales Page Builder', () => {
  describe('buildSalesPage()', () => {
    it('should generate HTML with complete structure', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.id).toBeTruthy();
      expect(build.html).toContain('<!DOCTYPE html>');
      expect(build.html).toContain('</html>');
      expect(build.html).toContain('sales-page-wrapper');
    });

    it('should include all 9 sections in generated HTML', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('data-section="hero"');
      expect(build.html).toContain('data-section="problem"');
      expect(build.html).toContain('data-section="solution"');
      expect(build.html).toContain('data-section="benefits"');
      expect(build.html).toContain('data-section="proof_social"');
      expect(build.html).toContain('data-section="offer"');
      expect(build.html).toContain('data-section="guarantee"');
      expect(build.html).toContain('data-section="faq"');
      expect(build.html).toContain('data-section="final_cta"');
    });

    it('should generate brand CSS with color variables', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.css).toContain('--brand-primary: #0616CA');
      expect(build.css).toContain('--brand-secondary: #FF6B6B');
      expect(build.css).toContain('--brand-accent: #A1C8F7');
      expect(build.css).toContain('--brand-neutral: #F5F5F5');
    });

    it('should generate brand CSS with font variables', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.css).toContain("--font-heading: 'Poppins'");
      expect(build.css).toContain("--font-body: 'Inter'");
    });

    it('should include sticky mobile CTA in HTML', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('sales-page-sticky-cta');
      expect(build.html).toContain('mobile-visible');
    });

    it('should render hero section with gradient background', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Transforme sua saúde');
      expect(build.html).toContain('hero');
    });

    it('should render problem section with emoji checkmarks', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('❌');
    });

    it('should render solution section with stages', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Etapa 1');
      expect(build.html).toContain('Etapa 2');
      expect(build.html).toContain('Etapa 3');
    });

    it('should render benefits section', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Economiza Tempo');
      expect(build.html).toContain('Aumenta Conversão');
    });

    it('should render proof social section with testimonials', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('3.5x');
    });

    it('should render offer section with price', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Investimento BRL 2990');
      expect(build.html).toContain('✅');
    });

    it('should render guarantee section', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Garantia 30 dias');
      expect(build.html).toContain('100%');
    });

    it('should render FAQ sections with accordion', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Quanto tempo para resultado?');
      expect(build.html).toContain('Funciona para meu negócio?');
      expect(build.html).toContain('sales-page-faq');
    });

    it('should render final CTA section', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('Pronto para começar?');
      expect(build.html).toContain('Começar Agora');
    });

    it('should include interactive JavaScript for FAQ', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('toggleFAQ');
      expect(build.html).toContain('classList.add');
    });

    it('should include responsive JavaScript for sticky CTA', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('updateStickyCtaVisibility');
      expect(build.html).toContain('window.innerWidth');
    });

    it('should calculate correct metadata', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.metadata.word_count).toBe(850);
      expect(build.metadata.estimated_read_time).toBe(4);
      expect(build.metadata.sections_count).toBe(9);
      expect(build.metadata.estimated_file_size).toBeGreaterThan(0);
    });

    it('should estimate file size under 100KB', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.metadata.estimated_file_size).toBeLessThan(100000);
    });

    it('should generate Lighthouse score between 50-100', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.performance_score?.lighthouse_score).toBeGreaterThanOrEqual(50);
      expect(build.performance_score?.lighthouse_score).toBeLessThanOrEqual(100);
    });

    it('should estimate load time under 5 seconds', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.performance_score?.estimated_load_time).toBeLessThan(5);
    });

    it('should include UTF-8 charset meta tag', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('charset="UTF-8"');
    });

    it('should include viewport meta tag for mobile', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('viewport');
      expect(build.html).toContain('width=device-width');
    });

    it('should have valid HTML lang attribute', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('lang="pt-BR"');
    });

    it('should include CSS scoped to sales-page-wrapper', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.css).toContain('.sales-page-wrapper');
      expect(build.css).toContain('sales-page-');
    });

    it('should include responsive design rules', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.css).toContain('@media (max-width: 768px)');
    });

    it('should escape HTML special characters in content', async () => {
      const contentWithHTML = {
        ...mockSalesPageContent,
        sections: {
          ...mockSalesPageContent.sections,
          hero: {
            ...mockSalesPageContent.sections.hero,
            heading: 'Test <script>alert("XSS")</script>',
          },
        },
      };

      const build = await buildSalesPage(contentWithHTML, mockBrandProfile, 'test-slug');

      expect(build.html).toContain('&lt;script&gt;');
      expect(build.html).not.toContain('<script>alert');
    });

    it('should handle missing offer details gracefully', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.html).toBeTruthy();
      expect(build.html.length).toBeGreaterThan(1000);
    });

    it('should build output with correct IDs', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.sales_page_id).toBe('sales-page-123');
      expect(build.brand_profile_id).toBe('brand-123');
      expect(build.client_id).toBe('client-123');
    });

    it('should have valid timestamp', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      expect(build.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('deploySalesPageToVPS()', () => {
    it('should return deployment status', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      const deployment = await deploySalesPageToVPS(build, 'test-slug');

      expect(deployment.status).toBeTruthy();
    });

    it('should include deployment URL', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      const deployment = await deploySalesPageToVPS(build, 'test-slug');

      expect(deployment.url).toContain('vendas.copyzen.com.br');
      expect(deployment.url).toContain('test-slug');
    });

    it('should record deployment time', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      const deployment = await deploySalesPageToVPS(build, 'test-slug');

      expect(deployment.deployment_time_ms).toBeGreaterThan(0);
    });

    it('should include file size in deployment', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      const deployment = await deploySalesPageToVPS(build, 'test-slug');

      expect(deployment.file_size).toBe(build.metadata.estimated_file_size);
    });

    it('should include Lighthouse score in deployment', async () => {
      const build = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'test-slug');

      const deployment = await deploySalesPageToVPS(build, 'test-slug');

      expect(deployment.lighthouse_score).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle brand profile with minimal data', async () => {
      const minimalBrand = {
        id: 'brand-min',
        client_id: 'client-123',
        color_palette: {
          primary: '#000000',
          secondary: '#FFFFFF',
          accent: '#CCCCCC',
          neutral: '#EEEEEE',
        },
        font_recommendations: {
          heading: 'Arial',
          body: 'Helvetica',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      const build = await buildSalesPage(mockSalesPageContent, minimalBrand, 'minimal-slug');

      expect(build.html).toBeTruthy();
      expect(build.css).toContain('#000000');
    });

    it('should handle sales page with long content', async () => {
      const longContent = {
        ...mockSalesPageContent,
        sections: {
          ...mockSalesPageContent.sections,
          hero: {
            ...mockSalesPageContent.sections.hero,
            copy: 'A'.repeat(5000),
          },
        },
      };

      const build = await buildSalesPage(longContent, mockBrandProfile, 'long-slug');

      expect(build.html).toContain('AAAAA');
      expect(build.metadata.estimated_file_size).toBeGreaterThan(0);
    });

    it('should handle different client slugs', async () => {
      const build1 = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'client-1');
      const build2 = await buildSalesPage(mockSalesPageContent, mockBrandProfile, 'client-2');

      expect(build1.id).not.toBe(build2.id);
    });
  });
});
