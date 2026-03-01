// Global error handler middleware
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { SupabaseError } from '@copyzen/shared/supabase.js';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error_code: string;
  message: string;
  timestamp: string;
  request_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation error helper
 */
export function formatValidationErrors(zodError: ZodError): Record<string, unknown> {
  const errors: Record<string, unknown> = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join('.');
    const message = issue.message;

    if (path) {
      errors[path] = message;
    } else {
      errors.general = message;
    }
  }

  return errors;
}

/**
 * Global error handler middleware
 * Must be registered as the last middleware
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      error_code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      timestamp,
      details: formatValidationErrors(err),
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    const errorResponse: ErrorResponse = {
      error_code: err.code,
      message: err.message,
      timestamp,
      ...(err.details && { details: err.details }),
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Supabase errors
  if (err instanceof SupabaseError) {
    const errorResponse: ErrorResponse = {
      error_code: err.code || 'DATABASE_ERROR',
      message: err.message || 'Database operation failed',
      timestamp,
    };
    if (err.details && typeof err.details === 'object') {
      errorResponse.details = err.details as Record<string, unknown>;
    }
    res.status(500).json(errorResponse);
    return;
  }

  // Handle generic errors
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);

    const errorResponse: ErrorResponse = {
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
    };
    res.status(500).json(errorResponse);
    return;
  }

  // Handle unknown errors
  // eslint-disable-next-line no-console
  console.error('Unknown error:', err);

  const errorResponse: ErrorResponse = {
    error_code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
  };
  res.status(500).json(errorResponse);
};
