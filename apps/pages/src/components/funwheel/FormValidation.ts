/**
 * Form Validation Utilities
 * Client-side validation for FunWheel forms
 */

import type { FormData, ValidationError } from './types.js';

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Brazilian phone number format
 * Accepts: (11)99999999 or (11)999999999 (no spaces)
 * Formatted version with spaces: (11) 99999-9999 or (11) 999999-9999
 */
export function validatePhone(phone: string): boolean {
  // Accept formatted: (11) 99999-9999 or unformatted: (11)99999999
  const formattedRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  const unformattedRegex = /^\(\d{2}\)\d{8,9}$/;
  return formattedRegex.test(phone) || unformattedRegex.test(phone);
}

/**
 * Format phone number to Brazilian format
 * Input: 11999999999 or 1199999999
 * Output: (11) 99999-9999 or (11) 9999-9999
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Validate form data
 */
export function validateFormData(data: Partial<FormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Nome deve ter pelo menos 2 caracteres',
    });
  }

  // Validate email
  if (!data.email || !validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email inválido',
    });
  }

  // Validate phone
  if (!data.phone || !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Telefone inválido. Use formato: (11) 99999-9999',
    });
  }

  return errors;
}

/**
 * Check if form data is completely valid
 */
export function isFormValid(data: Partial<FormData>): boolean {
  return validateFormData(data).length === 0;
}
