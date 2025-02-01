export abstract class BaseAgent {
  protected systemPrompt: string;
  
  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  protected async callChatAPI(prompt: string): Promise<string> {
    try {
      const maxPromptLength = 4000; // 设置一个安全的长度限制
      let truncatedPrompt = prompt;
      if (prompt.length > maxPromptLength) {
        console.warn(`Prompt too long (${prompt.length} chars), truncating to ${maxPromptLength} chars`);
        truncatedPrompt = prompt.slice(0, maxPromptLength) + '...';
      }

      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "THUDM/glm-4-9b-chat",
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt()
            },
            {
              role: "user",
              content: truncatedPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (data.code && data.message) {
        console.error(`API Error ${data.code}:`, data.message);
        throw new Error(data.message);
      }

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid API response structure');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`${this.constructor.name} API Error:`, error);
      throw new Error(`Failed to get response from ${this.constructor.name}: ${error.message}`);
    }
  }

  protected async callImageAPI(prompt: string): Promise<string> {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();
    return data.data[0].url;
  }
} 