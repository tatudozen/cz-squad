// LLM Adapter - Abstract interface for swappable LLM providers

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  system?: string;
}

export interface LLMCompletionResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
}

export interface LLMAdapter {
  generateCompletion(
    prompt: string,
    options?: LLMOptions
  ): Promise<LLMCompletionResponse>;
}

export class ClaudeAdapter implements LLMAdapter {
  constructor(private apiKey: string, private model: string = 'claude-opus-4') {}

  async generateCompletion(
    _prompt: string,
    _options?: LLMOptions
  ): Promise<LLMCompletionResponse> {
    // Placeholder - implementation in backend
    throw new Error('Not implemented in shared package');
  }
}

export function createLLMAdapter(provider: 'claude' | 'deepseek', apiKey: string): LLMAdapter {
  if (provider === 'claude') {
    return new ClaudeAdapter(apiKey);
  }
  throw new Error(`Unsupported LLM provider: ${provider}`);
}
