import type { ConversationSession, ConversationMessage } from '@/types/conversation.types';

export class AdminClient {
  private baseUrl: string;

  constructor() {
    // Normalize URL by removing trailing slashes to prevent double-slash issues
    this.baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    // Don't throw during build time (SSG), only validate at runtime
    if (typeof window !== 'undefined' && !this.baseUrl) {
      throw new Error('VITE_API_URL environment variable is not set');
    }
  }

  async getConversations(username: string, token: string): Promise<ConversationSession[]> {
    const response = await fetch(`${this.baseUrl}/admin/conversations/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch conversations' }));
      throw new Error(error.message || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async getConversationMessages(
    username: string,
    sessionId: string,
    token: string
  ): Promise<ConversationMessage[]> {
    const response = await fetch(
      `${this.baseUrl}/admin/conversations/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch conversation messages' }));
      throw new Error(error.message || 'Failed to fetch conversation messages');
    }

    const data = await response.json();
    return data.messages || [];
  }

  async deleteConversation(username: string, sessionId: string, token: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/admin/conversations/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete conversation' }));
      throw new Error(error.message || 'Failed to delete conversation');
    }
  }
}

export const adminClient = new AdminClient();
