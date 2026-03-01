/**
 * Tests for FunWheel Qualification Service (Etapa T)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateQualificationQuiz,
  scoreQualification,
  createQualificationResult,
  generateTierCTA,
} from '../generators/qualification.js';
import { BrandProfile, Briefing } from '@copyzen/shared/supabase.js';

describe('Qualification Service (FunWheel Etapa T)', () => {
  let testBriefing: Briefing;
  let testBrandProfile: BrandProfile;

  beforeAll(() => {
    testBriefing = {
      id: 'briefing-123',
      client_id: 'client-456',
      status: 'approved',
      business_name: 'Clínica Silva',
      segment: 'healthcare',
      target_audience: 'professionals aged 30-55',
      voice_tone: 'professional and warm',
      objectives: ['increase patient acquisition', 'build brand trust'],
      differentiators: 'personalized approach and cutting-edge technology',
      existing_colors: ['#06164A', '#6220FF'],
      logo_url: 'https://example.com/logo.png',
      competitor_references: [],
      monthly_budget: 5000,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: 'user-123',
      updated_at: new Date().toISOString(),
    };

    testBrandProfile = {
      id: 'profile-789',
      client_id: 'client-456',
      briefing_id: 'briefing-123',
      color_palette: {
        primary: '#06164A',
        secondary: '#6220FF',
        accent: '#A1C8F7',
        neutral: '#F5F5F5',
      },
      voice_guidelines: {
        tone: 'professional, warm, trustworthy',
        keywords_to_use: ['healthcare', 'innovation', 'care', 'trust'],
        keywords_to_avoid: ['cheap', 'quick fix', 'guarantee'],
        example_phrases: ['Your health, our priority', 'Innovation in care'],
      },
      visual_style: 'Modern, clean, healthcare-focused',
      font_recommendations: {
        heading: 'Poppins Bold, 32-48px',
        body: 'Inter Regular, 16-18px',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  describe('generateQualificationQuiz()', () => {
    it('should generate a complete quiz with 5 questions', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      expect(quiz.id).toBeDefined();
      expect(quiz.briefing_id).toBe('briefing-123');
      expect(quiz.presentation_id).toBe('presentation-123');
      expect(quiz.client_id).toBe('client-456');
      expect(quiz.questions.length).toBe(5);
    });

    it('should have valid question structure', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      quiz.questions.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.question.length).toBeGreaterThan(0);
        expect(['multipleChoice', 'yesNo']).toContain(question.questionType);
        expect(question.answers.length).toBeGreaterThanOrEqual(2);
        expect(question.theme).toBeDefined();
      });
    });

    it('should have valid answer structure with point values', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      quiz.questions.forEach((question) => {
        question.answers.forEach((answer) => {
          expect(answer.text).toBeDefined();
          expect(answer.text.length).toBeGreaterThan(0);
          expect(typeof answer.points).toBe('number');
          expect(answer.points).toBeGreaterThanOrEqual(0);
          expect(answer.points).toBeLessThanOrEqual(25);
        });
      });
    });

    it('should include different themes', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const themes = new Set(quiz.questions.map((q) => q.theme));
      expect(themes.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('scoreQualification()', () => {
    it('should calculate score as 0 for all low answers', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        q5: 0,
      };

      const result = scoreQualification(responses, quiz);
      expect(result.qualification_score).toBe(0);
      expect(result.qualification_tier).toBe('cold');
    });

    it('should calculate score as 100 for all high answers', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 3,
        q2: 3,
        q3: 3,
        q4: 1,
        q5: 3,
      };

      const result = scoreQualification(responses, quiz);
      expect(result.qualification_score).toBe(100);
      expect(result.qualification_tier).toBe('hot');
    });

    it('should calculate score as 50-74 for mixed answers (warm)', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 2,
        q2: 2,
        q3: 2,
        q4: 0,
        q5: 2,
      };

      const result = scoreQualification(responses, quiz);
      expect(result.qualification_score).toBeGreaterThanOrEqual(50);
      expect(result.qualification_score).toBeLessThanOrEqual(74);
      expect(result.qualification_tier).toBe('warm');
    });

    it('should handle partial responses gracefully', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 3,
        q2: 3,
      };

      const result = scoreQualification(responses, quiz);
      expect(result.qualification_score).toBeGreaterThanOrEqual(0);
      expect(result.qualification_score).toBeLessThanOrEqual(100);
      expect(['hot', 'warm', 'cold']).toContain(result.qualification_tier);
    });
  });

  describe('generateTierCTA()', () => {
    it('should generate HOT tier CTA', () => {
      const cta = generateTierCTA('hot', testBriefing);

      expect(cta.nextStepCta).toBeDefined();
      expect(cta.nextStepCta.length).toBeGreaterThan(0);
      expect(cta.thankYouMessage).toBeDefined();
      expect(cta.thankYouMessage).toContain('estratégia');
    });

    it('should generate WARM tier CTA', () => {
      const cta = generateTierCTA('warm', testBriefing);

      expect(cta.nextStepCta).toBeDefined();
      expect(cta.nextStepCta).toContain('Resource');
      expect(cta.thankYouMessage).toBeDefined();
      expect(cta.thankYouMessage).toContain('educativo');
    });

    it('should generate COLD tier CTA', () => {
      const cta = generateTierCTA('cold', testBriefing);

      expect(cta.nextStepCta).toBeDefined();
      expect(cta.nextStepCta).toContain('Content');
      expect(cta.thankYouMessage).toBeDefined();
      expect(cta.thankYouMessage).toContain('conteúdo');
    });

    it('should include business context in CTAs', () => {
      const cta = generateTierCTA('hot', testBriefing);

      // Check that message contains segment context (healthcare)
      if (testBriefing.segment) {
        expect(cta.thankYouMessage.toLowerCase()).toContain(
          testBriefing.segment.toLowerCase()
        );
      }
    });
  });

  describe('createQualificationResult()', () => {
    it('should create complete qualification result with HOT tier', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 3,
        q2: 3,
        q3: 3,
        q4: 1,
        q5: 3,
      };

      const result = createQualificationResult(
        'lead-123',
        'presentation-123',
        'briefing-123',
        quiz,
        responses,
        testBriefing
      );

      expect(result.id).toBeDefined();
      expect(result.lead_id).toBe('lead-123');
      expect(result.presentation_id).toBe('presentation-123');
      expect(result.briefing_id).toBe('briefing-123');
      expect(result.qualification_score).toBe(100);
      expect(result.qualification_tier).toBe('hot');
      expect(result.next_step_cta).toBeDefined();
      expect(result.thank_you_message).toBeDefined();
    });

    it('should map survey responses to answer text', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 0,
        q2: 1,
        q3: 2,
      };

      const result = createQualificationResult(
        'lead-123',
        'presentation-123',
        'briefing-123',
        quiz,
        responses,
        testBriefing
      );

      expect(Object.keys(result.survey_responses).length).toBeGreaterThanOrEqual(3);
      expect(result.survey_responses.q1).toBeDefined();
      expect(typeof result.survey_responses.q1).toBe('string');
    });

    it('should have valid ISO 8601 timestamps', () => {
      const quiz = generateQualificationQuiz(
        testBriefing,
        testBrandProfile,
        'presentation-123',
        'briefing-123',
        'client-456'
      );

      const responses = {
        q1: 1,
        q2: 1,
        q3: 1,
        q4: 0,
        q5: 1,
      };

      const result = createQualificationResult(
        'lead-123',
        'presentation-123',
        'briefing-123',
        quiz,
        responses,
        testBriefing
      );

      expect(new Date(result.created_at)).toBeInstanceOf(Date);
      expect(new Date(result.updated_at)).toBeInstanceOf(Date);
    });
  });
});
