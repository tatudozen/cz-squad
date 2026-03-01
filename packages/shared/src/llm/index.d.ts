export interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    system?: string;
}
export interface LLMCompletionResponse {
    content: string;
    tokens_used: {
        input: number;
        output: number;
        total: number;
    };
    model: string;
}
export interface LLMAdapter {
    generateCompletion(prompt: string, options?: LLMOptions): Promise<LLMCompletionResponse>;
}
export declare class ClaudeAdapter implements LLMAdapter {
    private apiKey;
    private model;
    constructor(apiKey: string, model?: string);
    generateCompletion(_prompt: string, _options?: LLMOptions): Promise<LLMCompletionResponse>;
}
export declare function createLLMAdapter(provider: 'claude' | 'deepseek', apiKey: string): LLMAdapter;
//# sourceMappingURL=index.d.ts.map