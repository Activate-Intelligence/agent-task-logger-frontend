export interface ConversationSession {
  session_id: string;
  last_message_at: string; // ISO timestamp
  message_count: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  message_timestamp: string; // ISO timestamp
}

export interface ConversationWithMessages extends ConversationSession {
  messages: ConversationMessage[];
}
