export abstract class BaseAgent {
  protected systemPrompt: string;
  
  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
} 