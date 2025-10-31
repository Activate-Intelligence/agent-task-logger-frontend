/**
 * AI Client for Task Logging
 * Communicates with AI Proxy Lambda that connects to Anthropic Claude API
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  toolResults?: any[];
  error?: string;
}

export class AIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Normalize URL by removing trailing slashes
    this.baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    if (!this.baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async sendMessage(prompt: string, history?: Message[]): Promise<AIResponse> {
    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai/log-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          prompt,
          history: history || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        message: data.response || data.message || 'Task logged successfully',
        toolResults: data.toolResults || data.tool_results,
        error: data.error,
      };
    } catch (error) {
      console.error('AI client error:', error);
      throw error instanceof Error ? error : new Error('Failed to communicate with AI');
    }
  }

  /**
   * Stream messages for real-time responses (future enhancement)
   */
  async *streamMessage(prompt: string, history?: Message[]): AsyncGenerator<string> {
    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    const response = await fetch(`${this.baseUrl}/ai/log-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        prompt,
        history: history || [],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  }
}

// Export singleton instance
export const aiClient = new AIClient();
