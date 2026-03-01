/**
 * Qualification Service (FunWheel Etapa T)
 * Generates qualification quizzes and scores lead engagement
 */

import { BrandProfile, Briefing } from '@copyzen/shared/supabase.js';
import type {
  QualificationQuiz,
  QualificationResult,
  QualificationTier,
  QuizQuestion,
} from '../../../types/funwheel.js';

/**
 * Generate a qualification quiz based on briefing and business profile
 */
export function generateQualificationQuiz(
  briefing: Briefing,
  _brandProfile: BrandProfile,
  presentationId: string,
  briefingId: string,
  clientId: string
): QualificationQuiz {
  const startTime = performance.now();

  try {
    // eslint-disable-next-line no-console
    console.log(`[QUIZ_GENERATION_STARTED] briefing_id=${briefingId}`);

    const questions = generateQuestions(briefing);

    const endTime = performance.now();
    const timeMs = Math.ceil(endTime - startTime);

    const quiz: QualificationQuiz = {
      id: crypto.randomUUID(),
      briefing_id: briefingId,
      presentation_id: presentationId,
      client_id: clientId,
      questions,
      created_at: new Date().toISOString(),
    };

    // eslint-disable-next-line no-console
    console.log(`[QUIZ_GENERATED] id=${quiz.id} questions=${questions.length} time_ms=${timeMs}`);
    return quiz;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('[QUIZ_GENERATION_ERROR]', errorMessage);
    throw error;
  }
}

/**
 * Score a lead's responses and determine tier
 */
export function scoreQualification(
  responses: Record<string, number>,
  quiz: QualificationQuiz
): Pick<QualificationResult, 'qualification_score' | 'qualification_tier'> {
  let totalScore = 0;
  let totalPoints = 0;

  // Calculate score from responses
  for (const [questionId, answerIndex] of Object.entries(responses)) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question && answerIndex >= 0 && answerIndex < question.answers.length) {
      const answer = question.answers[answerIndex];
      totalScore += answer.points;
      totalPoints += 25; // Each question max 25 points
    }
  }

  // Normalize to 0-100 scale
  const normalizedScore = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
  const tier = determineTier(normalizedScore);

  return {
    qualification_score: normalizedScore,
    qualification_tier: tier,
  };
}

/**
 * Determine tier based on score
 */
function determineTier(score: number): QualificationTier {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

/**
 * Generate tier-specific CTA and thank you message
 */
export function generateTierCTA(
  tier: QualificationTier,
  briefing: Briefing
): { nextStepCta: string; thankYouMessage: string } {
  const ctaMap: Record<QualificationTier, { cta: string; message: string }> = {
    hot: {
      cta: 'Schedule Your Strategy Session Now',
      message: `Parabéns! Você está no caminho certo para transformar seu ${briefing.segment}. Vamos agendar uma sessão de estratégia para criar seu plano de ação personalizado.`,
    },
    warm: {
      cta: 'Get Your Free Resources',
      message: `Ótimo! Você tem o interesse e o potencial certo. Receba nossos melhores recursos educativos para aprofundar seu conhecimento sobre ${briefing.objectives[0]}.`,

    },
    cold: {
      cta: 'Explore Our Content Library',
      message: `Excelente ter você aqui! Explore nossa biblioteca de conteúdo educativo sobre ${briefing.objectives[0]} e volte em breve quando estiver pronto para dar o próximo passo.`,
    },
  };

  const tierData = ctaMap[tier];
  return {
    nextStepCta: tierData.cta,
    thankYouMessage: tierData.message,
  };
}

/**
 * Generate full qualification result
 */
export function createQualificationResult(
  leadId: string,
  presentationId: string,
  briefingId: string,
  quiz: QualificationQuiz,
  responses: Record<string, number>,
  briefing: Briefing
): QualificationResult {
  const { qualification_score, qualification_tier } = scoreQualification(responses, quiz);
  const { nextStepCta, thankYouMessage } = generateTierCTA(qualification_tier, briefing);

  // Map responses to answer text
  const surveyResponses: Record<string, string> = {};
  for (const [questionId, answerIndex] of Object.entries(responses)) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question && answerIndex >= 0 && answerIndex < question.answers.length) {
      surveyResponses[questionId] = question.answers[answerIndex].text;
    }
  }

  return {
    id: crypto.randomUUID(),
    lead_id: leadId,
    presentation_id: presentationId,
    briefing_id: briefingId,
    qualification_score,
    qualification_tier,
    survey_responses: surveyResponses,
    next_step_cta: nextStepCta,
    thank_you_message: thankYouMessage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Helper: Generate quiz questions
function generateQuestions(briefing: Briefing): QuizQuestion[] {
  return [
    {
      id: 'q1',
      question: `Qual é seu maior desafio atual em relação a ${briefing.objectives[0]}?`,
      questionType: 'multipleChoice',
      theme: 'challenge',
      answers: [
        { text: 'Não tenho nenhum desafio', points: 0 },
        { text: 'Tenho desafios menores', points: 10 },
        { text: 'Tenho desafios moderados', points: 17 },
        { text: 'Tenho desafios críticos', points: 25 },
      ],
    },
    {
      id: 'q2',
      question: `Há quanto tempo você vem buscando solucionar esse problema?`,
      questionType: 'multipleChoice',
      theme: 'timeline',
      answers: [
        { text: 'Acabei de perceber', points: 0 },
        { text: 'Há alguns meses', points: 10 },
        { text: 'Há mais de um ano', points: 18 },
        { text: 'Há vários anos', points: 25 },
      ],
    },
    {
      id: 'q3',
      question: `Qual é seu nível de interesse em encontrar uma solução AGORA?`,
      questionType: 'multipleChoice',
      theme: 'urgency',
      answers: [
        { text: 'Muito baixo, só explorando', points: 0 },
        { text: 'Baixo, mas considerando opções', points: 8 },
        { text: 'Alto, quero resolver em breve', points: 18 },
        { text: 'Muito alto, preciso resolver agora', points: 25 },
      ],
    },
    {
      id: 'q4',
      question: `Você tem orçamento disponível para investir nessa solução?`,
      questionType: 'yesNo',
      theme: 'budget',
      answers: [
        { text: 'Não', points: 0 },
        { text: 'Sim', points: 25 },
      ],
    },
    {
      id: 'q5',
      question: `Com que rapidez você espera ver resultados?`,
      questionType: 'multipleChoice',
      theme: 'expectations',
      answers: [
        { text: 'Sem pressa, tenho tempo', points: 0 },
        { text: 'Alguns meses é ideal', points: 10 },
        { text: 'Poucas semanas seria ótimo', points: 18 },
        { text: 'Preciso de resultados rapidamente', points: 25 },
      ],
    },
  ];
}
