/**
 * Sales Page Builder
 * Transforms SalesPageContent into static HTML + CSS
 */

import { randomUUID } from 'crypto';
import type { SalesPageContent } from '../../types/sales-page.js';
import type { BrandProfile } from '@shared/supabase.js';

export interface SalesPageBuildMetadata {
  word_count: number;
  sections_count: number;
  estimated_read_time: number;
  estimated_file_size: number;
}

export interface SalesPagePerformanceScore {
  lighthouse_score?: number;
  estimated_load_time?: number;
}

export interface SalesPageBuildOutput {
  id: string;
  sales_page_id: string;
  brand_profile_id: string;
  client_id: string;
  html: string;
  css: string;
  metadata: SalesPageBuildMetadata;
  performance_score?: SalesPagePerformanceScore;
  created_at: string;
}

export interface SalesPageDeploymentOutput {
  status: 'pending' | 'deployed' | 'failed';
  url?: string;
  deployment_time_ms: number;
  file_size: number;
  lighthouse_score?: number;
  error?: string;
}

/**
 * Generate CSS custom properties from brand profile
 */
function generateBrandCSS(brandProfile: BrandProfile): string {
  const colors = brandProfile.color_palette || {
    primary: '#0616CA',
    secondary: '#FF6B6B',
    accent: '#A1C8F7',
    neutral: '#F5F5F5',
  };

  const fonts = brandProfile.font_recommendations || {
    heading: 'Poppins',
    body: 'Inter',
  };

  return `
:root {
  --brand-primary: ${colors.primary};
  --brand-secondary: ${colors.secondary};
  --brand-accent: ${colors.accent};
  --brand-neutral: ${colors.neutral};
  --font-heading: '${fonts.heading}', sans-serif;
  --font-body: '${fonts.body}', sans-serif;
}

.sales-page-wrapper {
  font-family: var(--font-body);
  color: #333;
  line-height: 1.6;
}

.sales-page-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .sales-page-section {
    padding: 2rem 1rem;
  }
}

.sales-page-heading {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--brand-primary);
}

@media (max-width: 768px) {
  .sales-page-heading {
    font-size: 1.75rem;
  }
}

.sales-page-cta {
  display: inline-block;
  background-color: var(--brand-accent);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.sales-page-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.sales-page-cta.primary {
  background-color: var(--brand-primary);
}

.sales-page-cta.secondary {
  background-color: var(--brand-secondary);
}

.sales-page-cta.lg {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
}

.sales-page-section.hero {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%);
  color: white;
  text-align: center;
  padding: 6rem 2rem;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sales-page-section.hero .sales-page-heading {
  color: white;
  font-size: 3rem;
}

@media (max-width: 768px) {
  .sales-page-section.hero {
    min-height: 400px;
    padding: 3rem 1.5rem;
  }

  .sales-page-section.hero .sales-page-heading {
    font-size: 2rem;
  }
}

.sales-page-section.hero .subheading {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.95);
}

.sales-page-section.light {
  background-color: #f9f9f9;
}

.sales-page-section.dark {
  background-color: #2c2c2c;
  color: white;
}

.sales-page-section.dark .sales-page-heading {
  color: white;
}

.sales-page-section.accent {
  background-color: var(--brand-secondary);
  color: white;
}

.sales-page-section.accent .sales-page-heading {
  color: white;
}

.sales-page-benefit {
  margin-bottom: 2rem;
  padding: 1rem;
}

.sales-page-benefit h4 {
  font-family: var(--font-heading);
  color: var(--brand-primary);
  margin-bottom: 0.5rem;
}

.sales-page-testimonial {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--brand-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sales-page-testimonial-author {
  font-weight: 600;
  color: var(--brand-primary);
  margin-top: 1rem;
}

.sales-page-faq {
  margin-bottom: 1.5rem;
}

.sales-page-faq-question {
  background: white;
  padding: 1.5rem;
  border: 2px solid var(--brand-primary);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.sales-page-faq-question:hover {
  background-color: #f9f9f9;
}

.sales-page-faq-answer {
  background: #f9f9f9;
  padding: 1.5rem;
  border-bottom: 2px solid var(--brand-primary);
  border-left: 2px solid var(--brand-primary);
  border-right: 2px solid var(--brand-primary);
  display: none;
}

.sales-page-faq-answer.active {
  display: block;
}

.sales-page-guarantee-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  margin: 1rem 0;
}

.sales-page-guarantee-badge::before {
  content: '✓';
  margin-right: 0.5rem;
  font-size: 1.5rem;
}

.sales-page-sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--brand-accent);
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: none;
}

.sales-page-sticky-cta.mobile-visible {
  display: block;
}

.sales-page-sticky-cta button {
  width: 100%;
  padding: 1rem;
  background-color: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sales-page-sticky-cta button:active {
  transform: scale(0.98);
}

.sales-page-countdown {
  display: inline-block;
  background-color: #ff4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  margin: 1rem 0;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.sales-page-content {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.sales-page-content strong {
  color: var(--brand-primary);
  font-weight: 600;
}

.sales-page-content em {
  color: var(--brand-secondary);
  font-style: italic;
}

.sales-page-list {
  margin: 1.5rem 0;
  padding-left: 2rem;
}

.sales-page-list li {
  margin-bottom: 0.75rem;
}

.sales-page-list li::before {
  content: '✓ ';
  color: var(--brand-primary);
  font-weight: 600;
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sales-page-section {
    padding: 2rem 1rem;
  }

  .sales-page-heading {
    font-size: 1.75rem;
  }

  .sales-page-sticky-cta.mobile-visible {
    display: block;
  }

  .sales-page-content {
    font-size: 1rem;
  }
}
`;
}

/**
 * Render a single section to HTML
 */
function renderSectionHTML(
  sectionKey: string,
  sectionData: any,
  _index: number
): string {
  const isFAQ = Array.isArray(sectionData);

  if (isFAQ) {
    return renderFAQHTML(sectionData, _index);
  }

  const bgClass = getBgClass(sectionKey);
  const heading = sectionData.heading || '';
  const copy = sectionData.copy || '';
  const ctaText = sectionData.cta_text;

  const html = `
    <section class="sales-page-section ${bgClass}" data-section="${sectionKey}">
      <div class="sales-page-content">
        <h2 class="sales-page-heading">${escapeHTML(heading)}</h2>
        <div class="sales-page-body">
          ${convertMarkdownToHTML(copy)}
        </div>
        ${ctaText ? `<a href="#" class="sales-page-cta primary lg">${escapeHTML(ctaText)}</a>` : ''}
      </div>
    </section>
  `;

  return html.trim();
}

/**
 * Render FAQ sections
 */
function renderFAQHTML(faqSections: any[], _index: number): string {
  const faqHTML = faqSections
    .map(
      (item, i) => `
    <div class="sales-page-faq" data-faq-index="${i}">
      <div class="sales-page-faq-question" onclick="toggleFAQ(this)">
        <span>${escapeHTML(item.question)}</span>
        <span>+</span>
      </div>
      <div class="sales-page-faq-answer">
        ${convertMarkdownToHTML(item.answer)}
      </div>
    </div>
  `
    )
    .join('');

  return `
    <section class="sales-page-section light" data-section="faq">
      <div class="sales-page-content">
        <h2 class="sales-page-heading">Perguntas Frequentes</h2>
        <div>${faqHTML}</div>
      </div>
    </section>
  `.trim();
}

/**
 * Get background class based on section type
 */
function getBgClass(sectionKey: string): string {
  const bgMap: Record<string, string> = {
    hero: 'hero',
    problem: 'light',
    solution: 'accent',
    benefits: 'light',
    proof_social: 'light',
    offer: 'dark',
    guarantee: 'light',
    faq: 'light',
    final_cta: 'hero',
  };

  return bgMap[sectionKey] || 'light';
}

/**
 * Convert Markdown to basic HTML
 */
function convertMarkdownToHTML(markdown: string): string {
  let html = escapeHTML(markdown);

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="mt-4 mb-2 font-semibold">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="mt-6 mb-3 text-xl font-bold">$1</h2>');

  // Lists (simple bullet detection)
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');

  // Checkmarks and emoji
  html = html.replace(/❌/g, '❌');
  html = html.replace(/✅/g, '✅');
  html = html.replace(/⭐/g, '⭐');

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Calculate file size estimate
 */
function estimateFileSize(html: string, css: string): number {
  // Estimate gzipped size (roughly 30% of original)
  const combined = html + css;
  const minified = combined.replace(/\s+/g, ' ');
  return Math.ceil(minified.length * 0.3);
}

/**
 * Generate estimated Lighthouse score based on content
 */
function estimateLighthouseScore(html: string, fileSize: number): number {
  let score = 100;

  // Penalize for large files
  if (fileSize > 100000) score -= 15;
  else if (fileSize > 80000) score -= 10;
  else if (fileSize > 60000) score -= 5;

  // Bonus for optimized content
  if (html.includes('loading="lazy"')) score += 5;

  // Estimate CLS (Cumulative Layout Shift)
  if (!html.includes('width:') && !html.includes('height:')) score -= 10;

  return Math.max(50, Math.min(100, score));
}

/**
 * Calculate estimated load time on 4G (using WebPageTest methodology)
 */
function estimateLoadTime4G(fileSize: number): number {
  // 4G typical: ~2 Mbps = 250 KB/s
  const loadTimeSeconds = fileSize / 250000;

  // Add DNS + TCP overhead (roughly 1s)
  return Math.max(0.5, loadTimeSeconds + 0.5);
}

/**
 * Build sales page from content and brand profile
 */
export async function buildSalesPage(
  salesPageContent: SalesPageContent,
  brandProfile: BrandProfile,
  _clientSlug: string
): Promise<SalesPageBuildOutput> {
  const buildId = randomUUID();
  const sections = salesPageContent.sections as any;

  // Generate brand CSS
  const brandCSS = generateBrandCSS(brandProfile);

  // Render all sections
  const sectionHTMLs = Object.entries(sections)
    .map(([key, value], idx) => renderSectionHTML(key, value, idx))
    .join('\n');

  // Build complete HTML document
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Página de vendas profissional gerada pela CopyZen">
  <title>Oferta Exclusiva</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    ${brandCSS}
  </style>
</head>
<body>
  <div class="sales-page-wrapper">
    ${sectionHTMLs}
  </div>

  <div class="sales-page-sticky-cta mobile-visible">
    <button class="sales-page-cta primary lg">Começar Agora</button>
  </div>

  <script>
    // FAQ toggle functionality
    function toggleFAQ(element) {
      const answer = element.nextElementSibling;
      const isActive = answer.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.sales-page-faq-answer.active').forEach(el => {
        el.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        answer.classList.add('active');
      }
    }

    // Mobile sticky CTA visibility (only < 768px)
    function updateStickyCtaVisibility() {
      const stickyCTA = document.querySelector('.sales-page-sticky-cta');
      if (window.innerWidth <= 768) {
        stickyCTA.classList.add('mobile-visible');
      } else {
        stickyCTA.classList.remove('mobile-visible');
      }
    }

    window.addEventListener('resize', updateStickyCtaVisibility);
    updateStickyCtaVisibility();

    // Smooth scroll for CTAs
    document.querySelectorAll('.sales-page-cta').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('CTA clicked');
      });
    });
  </script>
</body>
</html>`;

  // Calculate metadata
  const css = brandCSS;
  const fileSize = estimateFileSize(html, css);
  const lighthouseScore = estimateLighthouseScore(html, fileSize);
  const estimatedLoadTime = estimateLoadTime4G(fileSize);

  const buildOutput: SalesPageBuildOutput = {
    id: buildId,
    sales_page_id: salesPageContent.id,
    brand_profile_id: brandProfile.id,
    client_id: salesPageContent.client_id,
    html,
    css,
    metadata: {
      word_count: salesPageContent.metadata.total_words,
      sections_count: Object.keys(sections).length,
      estimated_read_time: salesPageContent.metadata.estimated_read_time_minutes,
      estimated_file_size: fileSize,
    },
    performance_score: {
      lighthouse_score: lighthouseScore,
      estimated_load_time: estimatedLoadTime,
    },
    created_at: new Date().toISOString(),
  };

  return buildOutput;
}

/**
 * Deploy sales page to VPS
 */
export async function deploySalesPageToVPS(
  buildOutput: SalesPageBuildOutput,
  _clientSlug: string,
  _vpsEndpoint?: string
): Promise<SalesPageDeploymentOutput> {
  const deploymentStartTime = Date.now();

  try {
    // In production, would call the actual VPS endpoint
    // For MVP, we simulate success
    const deploymentTimeMs = Date.now() - deploymentStartTime;

    const deploymentOutput: SalesPageDeploymentOutput = {
      status: 'deployed',
      url: `https://vendas.copyzen.com.br/page-${buildOutput.sales_page_id.substring(0, 8)}`,
      deployment_time_ms: deploymentTimeMs,
      file_size: buildOutput.metadata.estimated_file_size,
      lighthouse_score: buildOutput.performance_score?.lighthouse_score,
    };

    return deploymentOutput;
  } catch (error) {
    const deploymentTimeMs = Date.now() - deploymentStartTime;

    return {
      status: 'failed',
      deployment_time_ms: deploymentTimeMs,
      file_size: buildOutput.metadata.estimated_file_size,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
    };
  }
}
