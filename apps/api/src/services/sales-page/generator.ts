/**
 * Sales Page Generator Service
 * Generates complete long-form sales page copy with 9 sections
 */

import { randomUUID } from 'crypto';
import type { Briefing, BrandProfile } from '@copyzen/shared/supabase';
import type {
  SalesPageContent,
  Section,
  FAQSection,
  OfferDetails,
  OfferPackage,
} from '../../types/sales-page.js';

/**
 * Generate hero section (headline + hook)
 */
export function generateHeroSection(
  briefing: Briefing,
  _brandProfile: BrandProfile
): Section {
  const segment = (briefing as any).segment || 'service';
  const targetAudience = (briefing as any).targetAudience || 'professionals';

  return {
    heading: `Transforme sua ${segment.toLowerCase()} e alcance mais ${targetAudience}`,
    copy: `## O Problema está aí

Você sabe que precisa de uma estratégia de marketing, mas não tem tempo ou conhecimento técnico para executar sozinho.

**Hoje tudo muda.**

Nós criamos uma solução que transforma o briefing da sua marca em entregas completas (posts, funis, páginas de vendas) de forma automática. Sem complexidade. Sem espera.`,
    design_suggestion: 'Full-width hero with brand primary color gradient, large bold headline, subtext in secondary color',
    design_note: 'Hero background: linear gradient from brand primary to secondary, 100vh height on desktop, 70vh on mobile. Text centered, white text for contrast.',
    cta_text: 'Começar agora',
    cta_type: 'primary',
  };
}

/**
 * Generate problem section (pain points)
 */
export function generateProblemSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile
): Section {

  const painPoints = [
    '❌ Você gasta horas em redes sociais mas não vê conversão',
    '❌ Cada cliente que sai é um problema porque falta um pipeline estruturado',
    '❌ Seu time despende tempo com tarefas repetitivas que poderiam ser automatizadas',
    '❌ Falta consistência de marca em todas as suas entregas',
    '❌ Você não consegue escalar porque tudo depende do seu tempo',
  ];

  return {
    heading: '5 Sinais de que você está perdendo clientes',
    copy: `Se você se identifica com algum desses problemas, saiba que **não é só você**:

${painPoints.map((p) => `${p}`).join('\n')}

### Por que isso acontece?

A raiz do problema é simples: **marketing conversacional exige consistência, estrutura e velocidade que a maioria das pessoas não consegue manter sozinhas.**

Quando você tenta fazer tudo manualmente, inevitavelmente você:
- Perde mensagens no meio do caminho
- Não consegue manter frequência de postagem
- Não tem um funil estruturado para capturar leads
- Gasta tempo demais em execução e pouco em estratégia`,
    design_suggestion: 'Clean white background, red accent for pain points, serif font for headings',
    design_note: 'List items with red icon/bullet. Use accent color for emphasis on "não consegue". Add subtle shadow boxes around problem groups.',
  };
}

/**
 * Generate solution section
 */
export function generateSolutionSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile
): Section {
  return {
    heading: 'A Solução: Um Sistema Integrado de Automação',
    copy: `Apresentamos a **solução que transforma seu briefing em entregas completas**.

Nosso sistema trabalha em 3 etapas paralelas:

### 🎯 Etapa 1: Conteúdo Estratégico
Geramos pacotes de posts para Instagram e LinkedIn que constroem autoridade e trazem tráfego qualificado.

### 🔥 Etapa 2: Funil de Captura (FunWheel)
Criamos um funil completo em 3 etapas:
- **Apresentação:** Página que articula seu problema + solução
- **Retenção:** Formulário para capturar leads (email, WhatsApp)
- **Qualificação:** Quiz que identifica leads Hot, Warm e Cold

### 💰 Etapa 3: Página de Vendas
Geramos uma página de vendas long-form estruturada para converter seus leads em clientes.

**O resultado?** Você tem um pipeline completo operando 24/7, gerando leads qualificados automaticamente.`,
    design_suggestion: 'Three-column layout on desktop, stacked on mobile. Icons for each stage. Brand accent color for highlights.',
    design_note: 'Use three large boxes with icons. Gradient background from light secondary color. Emphasize the word "automática" in brand primary color. Add checkmarks for features.',
  };
}

/**
 * Generate benefits section
 */
export function generateBenefitsSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile
): Section {
  const benefits = [
    {
      title: 'Economiza Tempo',
      description: 'Ao invés de gastar 20+ horas por semana em marketing, você investe 2 horas em planejar e deixa o sistema rodar.',
    },
    {
      title: 'Aumenta Conversão',
      description: 'Um funil estruturado converte 3x mais do que Posts aleatórios. Você qualifica leads antes de vender.',
    },
    {
      title: 'Crescimento Escalável',
      description: 'O sistema cresce com você. Quanto mais clientes, menos trabalho manual por cliente.',
    },
    {
      title: 'Consistência de Marca',
      description: 'Toda entrega (posts, funis, páginas) segue sua marca. Um único tom, uma única voz.',
    },
    {
      title: 'Controle Total',
      description: 'Você tem acesso total. Editar, ajustar, personalizar. O controle nunca sai das suas mãos.',
    },
    {
      title: 'Suporte Especializado',
      description: 'Você não está sozinho. Nossa equipe está aqui para garantir que você tenha sucesso.',
    },
  ];

  return {
    heading: 'O que você consegue quando implementa esse sistema',
    copy: `${benefits
      .map(
        (b) => `
#### ${b.title}
${b.description}
`
      )
      .join('')}

### Quando você implementa isso corretamente, você ganha de volta:

✅ **Tempo** para pensar em estratégia ao invés de ficar preso em execução
✅ **Confiança** de que seus leads estão sendo qualificados corretamente
✅ **Crescimento** consistente e previsível no seu pipeline`,
    design_suggestion: '6-column grid on desktop (2 rows x 3 cols), stacked on mobile. Icon + title + description. Hover effect on cards.',
    design_note: 'Benefit cards with subtle shadow. Icon in brand primary color (20px). Title in bold, description in secondary text. Card background light gray. Hover: lift effect (transform: translateY(-5px)).',
  };
}

/**
 * Generate proof social section
 */
export function generateProofSocialSection(
  briefing: Briefing,
  _brandProfile: BrandProfile
): Section {
  const testimonials = (briefing as any).proof_social?.testimonials || [
    {
      quote: 'Este sistema transformou completamente meu negócio. Agora tenho leads qualificados chegando automaticamente.',
      author: 'Cliente de Saúde',
    },
    {
      quote: 'Esperava demais dessa solução, mas ela entregou tudo que promete. Vale cada real investido.',
      author: 'Consultor de Negócios',
    },
  ];

  return {
    heading: 'O que dizem nossos clientes',
    copy: `${testimonials
      .slice(0, 3)
      .map((t: any) => `> "${t.quote}"\n> — **${t.author}**\n`)
      .join('\n')}

### Resultados Reais

- **3.5x** aumento em leads qualificados
- **42%** redução em tempo de execução
- **89%** de satisfação de clientes
- **$50k+** em receita gerada através do sistema`,
    design_suggestion: 'Testimonials with avatar placeholders, colored backgrounds. Metrics displayed in large bold numbers.',
    design_note: 'Testimonial boxes: white background with accent left border (5px). Avatar circle (48px). Quote in italics. Metrics: 4 columns, brand primary text, large font (32px+), secondary text below.',
  };
}

/**
 * Generate offer section
 */
export function generateOfferSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile,
  offerDetails?: OfferDetails
): Section {
  const price = offerDetails?.price || 2990;
  const currency = offerDetails?.price_currency || 'BRL';
  const hasLimitedOffer = offerDetails?.special_limited_offer ?? true;
  const deadline = offerDetails?.deadline || 'próximos 3 dias';

  let offerCopy = `## Aqui está exatamente o que você recebe:

✅ **Análise Completa da Sua Marca**
Nós estudamos sua marca, mercado e audiência a fundo.

✅ **Conteúdo Estratégico Mensal**
Um mês de posts prontos para Instagram e LinkedIn (16 posts).

✅ **Funil Completo (FunWheel)**
- Página de apresentação (landing)
- Formulário de captura de leads
- Quiz de qualificação automática

✅ **Página de Vendas Long-Form**
Página de vendas estruturada para converter seus leads.

✅ **Integração com suas ferramentas**
WhatsApp, Telegram, ou seu CRM favorito.

✅ **Suporte durante 90 dias**
Ajustes, otimizações e suporte via email/WhatsApp.`;

  if (offerDetails?.packages && offerDetails.packages.length > 0) {
    offerCopy += `\n\n### Planos Disponíveis\n\n`;
    offerDetails.packages.forEach((pkg: OfferPackage) => {
      const recommended = pkg.is_recommended ? ' ⭐ **Recomendado**' : '';
      offerCopy += `
**${pkg.name}** — R$ ${pkg.price}${recommended}
${pkg.features.map((f: string) => `- ${f}`).join('\n')}
`;
    });
  }

  if (hasLimitedOffer) {
    offerCopy += `\n\n### ⚡ OFERTA ESPECIAL LIMITADA\n\nEsta é uma oferta exclusiva válida apenas pelos **${deadline}**. Após esse período, o preço volta ao normal de R$ ${price * 1.3}.`;
  }

  return {
    heading: `Investimento: R$ ${price} em ${currency}`,
    copy: offerCopy,
    design_suggestion: 'Checklist style with green checkmarks. Price highlighted in large bold text. Limited offer banner in red/accent color.',
    design_note: 'Checkmarks in brand primary color (22px). Price in 48px bold font. Limited offer banner: red background, white text, 100% width, padding 20px, centered. Animation: pulse effect on price.',
  };
}

/**
 * Generate guarantee section
 */
export function generateGuaranteeSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile,
  offerDetails?: OfferDetails
): Section {
  const guaranteeDays = offerDetails?.guarantee?.length_days || 30;

  return {
    heading: `Garantia de ${guaranteeDays} Dias (Sem Perguntas)`,
    copy: `Nós acreditamos tão profundamente no valor que você vai receber que oferecemos uma garantia simples:

**Se por qualquer razão você não estiver 100% satisfeito nos primeiros ${guaranteeDays} dias, nós devolvemos cada real que você investiu.**

Sem perguntas. Sem complicação. Sem burocracia.

Por quê? Porque estamos tão confiantes de que você vai amar os resultados que não conseguimos imaginar você pedindo o dinheiro de volta.

### A verdade é:
- Você vai ter leads qualificados vindo para você
- Seu marketing vai ser consistente
- Você vai ter mais tempo para focar no que realmente importa

Mas se, por alguma razão, isso não acontecer, sua satisfação é o que importa. Dinheiro de volta, sem estresse.`,
    design_suggestion: 'Shield icon with guarantee badge. Bold text emphasizing "100%" and the guarantee period. Tick marks for guarantee conditions.',
    design_note: 'Shield icon (primary color) at top. Main message in 24px bold. ${guaranteeDays} days highlighted in brand accent. Subtext in secondary color. Box with light background and accent border. Checkmarks for conditions.',
  };
}

/**
 * Generate FAQ section
 */
export function generateFAQSection(
  _briefing: Briefing,
  _brandProfile: BrandProfile
): FAQSection[] {
  return [
    {
      question: 'Quanto tempo até eu ver resultados?',
      answer:
        'Você verá os primeiros leads em 5-7 dias após o funil estar ao vivo. A maioria dos clientes relata aumento consistente de qualidade de leads após 30 dias.',
      design_suggestion: 'Expandable accordion style',
      design_note: 'Plus icon that changes to minus on expand. Smooth transition. Question in bold, answer in regular weight.',
    },
    {
      question: 'Posso editar/customizar o conteúdo?',
      answer:
        'Sim! Você tem acesso total a tudo. Pode editar posts, funis, páginas. O sistema fornece os templates e estrutura, mas você customiza conforme sua marca.',
      design_suggestion: 'Expandable accordion style',
      design_note: 'Same styling as above. Consistent animation.',
    },
    {
      question: 'E se meu segmento for diferente (não mencionado aqui)?',
      answer:
        'Perfeito! O sistema é agnóstico de segmento. Funciona para qualquer tipo de serviço, produto digital, consultoria ou agência. Nós customizamos a análise inicial para seu nicho específico.',
      design_suggestion: 'Expandable accordion style',
      design_note: 'Same styling as above.',
    },
    {
      question: 'Preciso de conhecimento técnico?',
      answer:
        'Não. Você não precisa saber programação, design ou marketing avançado. Nós cuidamos de toda a parte técnica. Você só precisa fornecer informações sobre sua marca.',
      design_suggestion: 'Expandable accordion style',
      design_note: 'Same styling as above.',
    },
    {
      question: 'Como funciona o suporte?',
      answer:
        'Você tem acesso direto à nossa equipe por email ou WhatsApp. Respondemos em até 24 horas. Você também recebe um guia detalhado e vídeos sobre como usar cada parte do sistema.',
      design_suggestion: 'Expandable accordion style',
      design_note: 'Same styling as above.',
    },
  ];
}

/**
 * Generate final CTA section
 */
export function generateFinalCTASection(
  _briefing: Briefing,
  _brandProfile: BrandProfile
): Section {
  return {
    heading: 'Está pronto para transformar seu marketing?',
    copy: `Você já viu tudo que é possível quando você tem um sistema automatizado gerando leads qualificados para você.

A questão agora é simples: **Você quer fazer isso sozinho, ou quer deixar que o sistema faça para você?**

Se você escolher deixar o sistema cuidar disso, clique no botão abaixo e vamos começar hoje mesmo.

#### P.S.
Não esqueça: você tem ${30} dias de garantia. Se por qualquer razão não funcionar, você recebe seu dinheiro de volta. Sem risco, sem complicação.`,
    design_suggestion: 'Bold CTA button, countdown timer, scarcity messaging',
    design_note: 'Large primary button (48px height, bold text). Countdown timer above button showing remaining slots or days. Background accent color section. Animation: button pulse effect.',
    cta_text: 'Começar Agora',
    cta_type: 'primary',
  };
}

/**
 * Calculate metadata
 */
function calculateMetadata(sections: any): {
  total_words: number;
  estimated_read_time_minutes: number;
  conversion_elements_count: number;
  cta_count: number;
} {
  let totalWords = 0;
  let ctaCount = 0;

  // Count words in all sections
  Object.values(sections).forEach((section: any) => {
    if (typeof section === 'object' && section.copy) {
      totalWords += section.copy.split(/\s+/).length;
    }
    if (typeof section === 'object' && section.cta_text) {
      ctaCount++;
    }
    // Handle FAQ arrays
    if (Array.isArray(section)) {
      section.forEach((item: any) => {
        if (item.answer) {
          totalWords += item.answer.split(/\s+/).length;
        }
      });
    }
  });

  const estimatedReadTime = Math.ceil(totalWords / 200); // 200 words per minute average
  const conversionElementsCount = ctaCount + 2; // CTAs + guarantee + final CTA

  return {
    total_words: totalWords,
    estimated_read_time_minutes: estimatedReadTime,
    conversion_elements_count: conversionElementsCount,
    cta_count: ctaCount,
  };
}

/**
 * Main generator function
 */
export async function generateSalesPageContent(
  briefing: Briefing,
  brandProfile: BrandProfile,
  clientId: string,
  briefingId: string,
  brandProfileId: string,
  offerDetails?: OfferDetails
): Promise<SalesPageContent> {
  const sections = {
    hero: generateHeroSection(briefing, brandProfile),
    problem: generateProblemSection(briefing, brandProfile),
    solution: generateSolutionSection(briefing, brandProfile),
    benefits: generateBenefitsSection(briefing, brandProfile),
    proof_social: generateProofSocialSection(briefing, brandProfile),
    offer: generateOfferSection(briefing, brandProfile, offerDetails),
    guarantee: generateGuaranteeSection(briefing, brandProfile, offerDetails),
    faq: generateFAQSection(briefing, brandProfile),
    final_cta: generateFinalCTASection(briefing, brandProfile),
  };

  const metadata = calculateMetadata(sections);
  const now = new Date().toISOString();

  // eslint-disable-next-line no-console
  console.log(`[SALES_PAGE_GENERATED] id=${randomUUID()} briefing_id=${briefingId} sections=9 total_words=${metadata.total_words}`);

  return {
    id: randomUUID(),
    briefing_id: briefingId,
    brand_profile_id: brandProfileId,
    client_id: clientId,
    sections,
    metadata,
    created_at: now,
    updated_at: now,
  };
}
