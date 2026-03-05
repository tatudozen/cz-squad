import { Anthropic } from "@anthropic-ai/sdk";
import type { Briefing, BrandProfile } from "@copyzen/shared/types/index.js";
import type { 
  SalesPageContent, 
  SalesPageSections, 
  Section, 
  FAQSection, 
  OfferDetails,
  SalesPageMetadata 
} from "../../types/sales-page.js";

const DEFAULT_OFFER: OfferDetails = {
  price_currency: 'BRL',
  guarantee: {
    length_days: 30,
    description: 'Garantia de satisfação de 30 dias ou dinheiro de volta'
  }
};

export async function generateSalesPage(
  briefing: Briefing,
  brandProfile: BrandProfile,
  clientId: string,
  offerDetails?: OfferDetails
): Promise<SalesPageContent> {
  const client = new Anthropic();
  const offer = { ...DEFAULT_OFFER, ...offerDetails };
  
  const context = buildPromptContext(briefing, brandProfile, offer);
  
  // Generate all sections in parallel
  const [hero, problem, solution, benefits, proofSocial, offerSection, guarantee, faq, finalCta] = await Promise.all([
    generateHero(client, context),
    generateProblem(client, context),
    generateSolution(client, context),
    generateBenefits(client, context),
    generateProofSocial(client, context),
    generateOffer(client, context, offer),
    generateGuarantee(client, context, offer),
    generateFAQ(client, context),
    generateFinalCTA(client, context)
  ]);

  const sections: SalesPageSections = {
    hero,
    problem,
    solution,
    benefits,
    proof_social: proofSocial,
    offer: offerSection,
    guarantee,
    faq,
    final_cta: finalCta
  };

  const metadata = calculateMetadata(sections);

  return {
    id: crypto.randomUUID(),
    briefing_id: briefing.id,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    sections,
    metadata,
    created_at: new Date().toISOString()
  };
}

function buildPromptContext(briefing: Briefing, brandProfile: BrandProfile, offer: OfferDetails): string {
  return `
CONTEXTO:
- Empresa: ${briefing.business_name}
- Segmento: ${briefing.segment}
- Público: ${briefing.target_audience}
- Tom: ${briefing.voice_tone}
- Diferenciais: ${briefing.differentiators}
- Preço: ${offer.price ? `${offer.price} ${offer.price_currency}` : 'A definir'}
`;
}

async function generateHero(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

Crie a seção HERO (em português BR) com:
- heading (< 10 palavras, impactante)
- copy (promessa de transformação)
- design_suggestion (fundo/visual)
- design_note

RESPONDA APENAS COM JSON (sem markdown, sem código):
{ "heading": "...", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'Transforme Seu Negócio',
      copy: text,
      design_suggestion: 'Gradiente atrativo',
      design_note: 'Primárias da marca'
    };
  }
}

async function generateProblem(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

SEÇÃO PROBLEMA (português BR):
- Pintar a dor (3-5 pontos)
- Conseqüências
- Ressonância emocional

JSON:
{ "heading": "O Problema", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'O Problema',
      copy: text,
      design_suggestion: 'Texto destacado',
      design_note: 'Cores quentes'
    };
  }
}

async function generateSolution(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

SEÇÃO SOLUÇÃO (português BR):
- O que é oferecido
- Como funciona (3-5 passos)
- Por que é diferente

JSON:
{ "heading": "A Solução", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'A Solução',
      copy: text,
      design_suggestion: 'Timeline',
      design_note: 'Progresso visual'
    };
  }
}

async function generateBenefits(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

SEÇÃO BENEFÍCIOS (português BR):
- Contraste antes/depois
- 5-7 benefícios (emocionais + lógicos)

JSON:
{ "heading": "O Que Você Vai Conseguir", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'O Que Você Vai Conseguir',
      copy: text,
      design_suggestion: 'Cards',
      design_note: 'Grid responsivo'
    };
  }
}

async function generateProofSocial(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

SEÇÃO PROVA SOCIAL (português BR):
- Testemunhos (2-3)
- Case studies
- Credenciais

JSON:
{ "heading": "Resultados Reais", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'Resultados Reais',
      copy: text,
      design_suggestion: 'Testimonial cards',
      design_note: 'Avatares + nomes'
    };
  }
}

async function generateOffer(client: Anthropic, context: string, offer: OfferDetails): Promise<Section> {
  const prompt = `${context}

SEÇÃO OFERTA (português BR):
- Estrutura clara de preço
- Pacotes
- O que está incluído
- Urgência

JSON:
{ "heading": "Obtenha Agora", "copy": "...", "design_suggestion": "...", "design_note": "...", "cta_text": "Começar Agora", "cta_type": "primary" }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'Obtenha Agora',
      copy: text,
      design_suggestion: 'Destaque colorido',
      design_note: 'Preço em destaque',
      cta_text: 'Começar Agora',
      cta_type: 'primary'
    };
  }
}

async function generateGuarantee(client: Anthropic, context: string, offer: OfferDetails): Promise<Section> {
  const prompt = `${context}

SEÇÃO GARANTIA (português BR):
- ${offer.guarantee?.length_days || 30} dias de garantia
- Tranquilizar cliente
- Remover objeções

JSON:
{ "heading": "Nossa Garantia", "copy": "...", "design_suggestion": "...", "design_note": "..." }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'Nossa Garantia',
      copy: text,
      design_suggestion: 'Badge com checkmark',
      design_note: 'Verde para confiança'
    };
  }
}

async function generateFAQ(client: Anthropic, context: string): Promise<FAQSection[]> {
  const prompt = `${context}

SEÇÃO FAQ (português BR):
3-4 perguntas sobre:
- Como funciona
- Requisitos técnicos
- Resultados esperados

JSON ARRAY:
[{ "question": "...", "answer": "...", "heading": "FAQ", "copy": "...", "design_suggestion": "...", "design_note": "..." }]`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [{
      question: 'Como funciona?',
      answer: text,
      heading: 'FAQ',
      copy: 'Dúvidas frequentes',
      design_suggestion: 'Accordion',
      design_note: 'Collapse/expand'
    }];
  }
}

async function generateFinalCTA(client: Anthropic, context: string): Promise<Section> {
  const prompt = `${context}

SEÇÃO CTA FINAL (português BR):
- Button text orientado ao benefício
- Urgência
- Próximo passo claro

JSON:
{ "heading": "Pronto para Começar?", "copy": "...", "design_suggestion": "...", "design_note": "...", "cta_text": "Começar Agora", "cta_type": "primary" }`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    return {
      heading: 'Pronto para Começar?',
      copy: text,
      design_suggestion: 'CTA grande',
      design_note: 'Botão destacado',
      cta_text: 'Começar Agora',
      cta_type: 'primary'
    };
  }
}

function calculateMetadata(sections: SalesPageSections): SalesPageMetadata {
  const getAllCopies = () => [
    sections.hero.copy,
    sections.problem.copy,
    sections.solution.copy,
    sections.benefits.copy,
    sections.proof_social.copy,
    sections.offer.copy,
    sections.guarantee.copy,
    sections.final_cta.copy,
    ...sections.faq.map(f => f.answer)
  ];

  const totalText = getAllCopies().join(' ');
  const totalWords = totalText.split(/\s+/).length;
  const readTimeMinutes = Math.ceil(totalWords / 200);

  const ctaCount = [
    sections.hero,
    sections.offer,
    sections.final_cta
  ].filter(s => s.cta_text).length;

  return {
    total_words: totalWords,
    estimated_read_time_minutes: readTimeMinutes,
    conversion_elements_count: ctaCount + sections.faq.length,
    cta_count: ctaCount
  };
}
