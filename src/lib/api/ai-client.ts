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
  sessionId?: string;
  error?: string;
}

export class AIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Normalize URL by removing trailing slashes
    this.baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    // Validate at runtime
    if (typeof window !== 'undefined' && !this.baseUrl) {
      throw new Error('VITE_API_URL environment variable is not set');
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async sendMessage(prompt: string, sessionId?: string): Promise<AIResponse> {
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
          session_id: sessionId, // Send session_id to backend
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
        sessionId: data.sessionId, // Capture session_id from response
        error: data.error,
      };
    } catch (error) {
      console.error('AI client error:', error);
      throw error instanceof Error ? error : new Error('Failed to communicate with AI');
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<Message[]> {
    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai/log-task/history/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch conversation history');
    }
  }

  /**
   * Stream messages for real-time responses (future enhancement)
   */
  async *streamMessage(prompt: string, sessionId?: string): AsyncGenerator<string> {
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
        session_id: sessionId,
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
