import { describe, it, expect } from 'vitest';
import { validateForm, validateField, briefingFormSchema } from '../lib/briefing-form-validation';

describe('BriefingCaptureForm - Validation', () => {
  describe('validateField', () => {
    it('should validate business_name field', () => {
      expect(validateField('business_name', 'Clínica Silva')).toBeNull();
      expect(validateField('business_name', 'AB')).not.toBeNull();
      expect(validateField('business_name', '')).not.toBeNull();
    });

    it('should validate segment field', () => {
      expect(validateField('segment', 'healthcare')).toBeNull();
      expect(validateField('segment', 'invalid-segment')).not.toBeNull();
      expect(validateField('segment', '')).not.toBeNull();
    });

    it('should validate target_audience field', () => {
      expect(validateField('target_audience', 'Médicos e pacientes')).toBeNull();
      expect(validateField('target_audience', 'Short')).not.toBeNull();
      expect(validateField('target_audience', '')).not.toBeNull();
    });

    it('should validate voice_tone field', () => {
      expect(validateField('voice_tone', 'professional')).toBeNull();
      expect(validateField('voice_tone', 'invalid-tone')).not.toBeNull();
      expect(validateField('voice_tone', '')).not.toBeNull();
    });

    it('should validate differentiators field', () => {
      expect(validateField('differentiators', 'We have unique technology and expertise')).toBeNull();
      expect(validateField('differentiators', 'Short')).not.toBeNull();
      expect(validateField('differentiators', '')).not.toBeNull();
    });

    it('should validate monthly_budget field', () => {
      expect(validateField('monthly_budget', 5000)).toBeNull();
      expect(validateField('monthly_budget', -100)).not.toBeNull();
      expect(validateField('monthly_budget', '')).toBeNull(); // Optional field
    });
  });

  describe('validateForm', () => {
    const validFormData = {
      business_name: 'Clínica Silva',
      segment: 'healthcare',
      target_audience: 'Médicos e pacientes com problemas de saúde',
      voice_tone: 'professional',
      objectives: ['increase-leads', 'boost-sales'],
      differentiators: 'We have the best technology and customer service',
    };

    it('should validate a complete valid form', () => {
      const result = validateForm(validFormData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject form with missing business_name', () => {
      const invalidData = { ...validFormData, business_name: '' };
      const result = validateForm(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors['business_name']).toBeDefined();
    });

    it('should reject form with invalid segment', () => {
      const invalidData = { ...validFormData, segment: 'invalid-segment' };
      const result = validateForm(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors['segment']).toBeDefined();
    });

    it('should reject form with empty objectives', () => {
      const invalidData = { ...validFormData, objectives: [] };
      const result = validateForm(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors['objectives']).toBeDefined();
    });

    it('should reject form with too many objectives', () => {
      const invalidData = {
        ...validFormData,
        objectives: ['increase-leads', 'boost-sales', 'build-awareness', 'educate-audience', 'other', 'another-one'],
      };
      const result = validateForm(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors['objectives']).toBeDefined();
    });

    it('should accept optional monthly_budget field', () => {
      const dataWithBudget = { ...validFormData, monthly_budget: 5000 };
      const result = validateForm(dataWithBudget);
      expect(result.valid).toBe(true);
    });

    it('should reject negative monthly_budget', () => {
      const invalidData = { ...validFormData, monthly_budget: -100 };
      const result = validateForm(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors['monthly_budget']).toBeDefined();
    });

    it('should validate all required fields present', () => {
      const minimalData = {
        business_name: 'Test Co',
        segment: 'fintech',
        target_audience: 'Young professionals',
        voice_tone: 'casual',
        objectives: ['boost-sales'],
        differentiators: 'We provide the best service in the market',
      };
      const result = validateForm(minimalData);
      expect(result.valid).toBe(true);
    });

    it('should handle all segment options', () => {
      const segments = ['healthcare', 'fintech', 'ecommerce', 'education', 'saas', 'retail', 'other'];
      segments.forEach((segment) => {
        const result = validateField('segment', segment);
        expect(result).toBeNull();
      });
    });

    it('should handle all voice tone options', () => {
      const tones = ['professional', 'casual', 'empathetic', 'urgent', 'friendly'];
      tones.forEach((tone) => {
        const result = validateField('voice_tone', tone);
        expect(result).toBeNull();
      });
    });

    it('should handle all objective options', () => {
      const objectives = ['increase-leads', 'boost-sales', 'build-awareness', 'educate-audience', 'other'];
      objectives.forEach((objective) => {
        const result = validateField('objectives', [objective]);
        expect(result).toBeNull();
      });
    });

    it('should provide descriptive error messages', () => {
      const invalidData = { ...validFormData, business_name: 'AB' };
      const result = validateForm(invalidData);
      expect(result.errors['business_name']).toContain('3');
    });
  });

  describe('briefingFormSchema', () => {
    it('should parse valid data', () => {
      const validData = {
        business_name: 'Test Company',
        segment: 'saas',
        target_audience: 'Enterprise customers',
        voice_tone: 'professional',
        objectives: ['increase-leads'],
        differentiators: 'Cutting-edge technology platform',
      };
      const result = briefingFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should enforce business_name length', () => {
      const tooShort = {
        business_name: 'AB',
        segment: 'saas',
        target_audience: 'Enterprise customers',
        voice_tone: 'professional',
        objectives: ['increase-leads'],
        differentiators: 'Cutting-edge technology platform',
      };
      const result = briefingFormSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });

    it('should enforce target_audience length', () => {
      const tooShort = {
        business_name: 'Test Company',
        segment: 'saas',
        target_audience: 'Users',
        voice_tone: 'professional',
        objectives: ['increase-leads'],
        differentiators: 'Cutting-edge technology platform',
      };
      const result = briefingFormSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });

    it('should enforce differentiators length', () => {
      const tooShort = {
        business_name: 'Test Company',
        segment: 'saas',
        target_audience: 'Enterprise customers',
        voice_tone: 'professional',
        objectives: ['increase-leads'],
        differentiators: 'Tech',
      };
      const result = briefingFormSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });
  });
});
