/**
 * LLM Adapter - Claude API Integration
 * Provides abstraction for calling Claude API with fallback support
 *
 * Story 1.5 references this (Copywriting Agent)
 * Story 2.1 uses this for content strategy generation
 */

import { logger } from './logger.ts';

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMAdapter {
  generateCompletion(prompt: string, options?: LLMOptions): Promise<string>;
}

/**
 * Claude Adapter - Primary LLM implementation
 */
class ClaudeAdapter implements LLMAdapter {
  async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    const model = options?.model || process.env.ANTHROPIC_MODEL || 'claude-opus-4';
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 1024;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.message || response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.content?.[0]?.text;

      if (!content) {
        throw new Error('No content in Claude API response');
      }

      logger.info('LLM completion generated', {
        model,
        input_tokens: data.usage?.input_tokens,
        output_tokens: data.usage?.output_tokens,
      });

      return content;
    } catch (error) {
      logger.error('LLM completion failed', {
        error: String(error),
        model,
      });
      throw error;
    }
  }
}

/**
 * Fallback adapters in case primary fails
 */
class DeepseekAdapter implements LLMAdapter {
  async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    // Placeholder for Deepseek integration
    // Would be implemented in future enhancement
    throw new Error('Deepseek adapter not yet implemented');
  }
}

/**
 * Export singleton instance of primary adapter
 */
export const llmAdapter: LLMAdapter = new ClaudeAdapter();

export default {
  ClaudeAdapter,
  DeepseekAdapter,
  llmAdapter,
};
