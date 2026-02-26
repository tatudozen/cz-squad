/**
 * FunWheel Astro Component Types
 * Type definitions for page rendering
 */

export interface FormData {
  name: string;
  email: string;
  phone: string;
  qualifier?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  data: Partial<FormData>;
  errors: ValidationError[];
  isValid: boolean;
}

export interface QuizAnswer {
  id: string;
  text: string;
  points: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  theme: string;
}

export interface QuizState {
  currentQuestion: number;
  responses: Record<string, number>;
  totalQuestions: number;
  isComplete: boolean;
  score?: number;
  tier?: 'hot' | 'warm' | 'cold';
}
