// LLM Adapter - Abstract interface for swappable LLM providers
export class ClaudeAdapter {
    constructor(apiKey, model = 'claude-opus-4') {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generateCompletion(_prompt, _options) {
        // Placeholder - implementation in backend
        throw new Error('Not implemented in shared package');
    }
}
export function createLLMAdapter(provider, apiKey) {
    if (provider === 'claude') {
        return new ClaudeAdapter(apiKey);
    }
    throw new Error(`Unsupported LLM provider: ${provider}`);
}
//# sourceMappingURL=index.js.map