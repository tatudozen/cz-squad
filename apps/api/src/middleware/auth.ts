/**
 * API Key Authentication Middleware
 * Validates X-API-Key header against OPERATOR_API_KEY
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../utils/config.js';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

/**
 * Middleware to validate API key from X-API-Key header
 * Required for protected endpoints
 */
export const validateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip validation if no API key is configured
  if (!config.operatorApiKey) {
    console.warn('[AUTH] Warning: OPERATOR_API_KEY not configured. All requests allowed.');
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-API-Key header',
      code: 'MISSING_API_KEY',
    });
  }

  if (apiKey !== config.operatorApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }

  // Store API key on request for logging/auditing
  req.apiKey = apiKey;

  next();
};

/**
 * Optional middleware for logging authenticated requests
 */
export const logAuthenticatedRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.apiKey) {
    console.log(`[AUTH] Authenticated request: ${req.method} ${req.path}`, {
      requestId: req.id,
      apiKeyPrefix: req.apiKey.substring(0, 8) + '***',
    });
  }
  next();
};
