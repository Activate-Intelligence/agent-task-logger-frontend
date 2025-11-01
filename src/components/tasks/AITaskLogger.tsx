
import { useState, useRef, useEffect } from 'react';
import { aiClient, Message } from '@/lib/api/ai-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
// ScrollArea component not needed - using regular div with overflow
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Loader2, Bot, User, AlertCircle, Sparkles } from 'lucide-react';

interface AITaskLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskLogged?: () => void;
}

export function AITaskLogger({ open, onOpenChange, onTaskLogged }: AITaskLoggerProps) {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    // Load sessionId from localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai-task-logger-session-id') || undefined;
    }
    return undefined;
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set token on mount
  useEffect(() => {
    if (token) {
      aiClient.setToken(token);
    }
  }, [token]);

  // Load conversation history when dialog opens with existing sessionId
  useEffect(() => {
    async function loadHistory() {
      if (open && sessionId && token) {
        setIsLoadingHistory(true);
        try {
          const history = await aiClient.getConversationHistory(sessionId);
          setMessages(history);
        } catch (err) {
          console.error('Failed to load conversation history:', err);
          // Don't show error to user - just start fresh
          setMessages([]);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    }

    loadHistory();
  }, [open, sessionId, token]);

  // Persist sessionId to localStorage whenever it changes
  useEffect(() => {
    if (sessionId && typeof window !== 'undefined') {
      localStorage.setItem('ai-task-logger-session-id', sessionId);
    }
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && !isLoadingHistory) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, isLoadingHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      // Send message with session_id (backend handles conversation history)
      const response = await aiClient.sendMessage(userMessage.content, sessionId);

      // Capture session_id from response for subsequent messages
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If task was logged, notify parent
      if (response.toolResults && response.toolResults.length > 0) {
        onTaskLogged?.();
      }
    } catch (err: any) {
      console.error('AI Task Logger error:', err);
      setError(err.message || 'Failed to process your request. Please try again.');

      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an error: ${err.message || 'Something went wrong'}. Please try again or rephrase your request.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError('');
    setInput('');
    setSessionId(undefined); // Reset session to start new conversation
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-task-logger-session-id');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Log Task with AI
          </DialogTitle>
          <DialogDescription>
            Describe your work in natural language, and Claude will log it for you
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoadingHistory && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-slate-600">Loading conversation history...</span>
              </div>
            )}

            {!isLoadingHistory && messages.length === 0 && (
              <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    💡 Try saying:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Worked 3 hours on Acme Corp website today</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Spent 2 hours debugging Microsoft Teams integration, still blocked by API limits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Logged 4 hours on IBM database optimization yesterday</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Show me my tasks from this week</span>
                    </li>
                  </ul>
                </div>
              </Card>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t bg-slate-50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your work... (e.g., 'Worked 3 hours on Acme Corp website')"
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              New conversation
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
