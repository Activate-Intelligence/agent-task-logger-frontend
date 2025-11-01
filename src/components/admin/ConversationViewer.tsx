import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageBubble } from './MessageBubble';
import { adminClient } from '@/lib/api/admin-client';
import { useAuthStore } from '@/stores/auth-store';
import type { ConversationMessage } from '@/types/conversation.types';

interface ConversationViewerProps {
  username: string;
  sessionId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function ConversationViewer({ username, sessionId, onBack, onDelete }: ConversationViewerProps) {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminClient.getConversationMessages(username, sessionId, token);
        setMessages(data);
      } catch (err: any) {
        console.error('Failed to fetch messages:', err);
        setError(err.message || 'Failed to load conversation messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [username, sessionId, token]);

  const handleDelete = async () => {
    if (!token) return;

    try {
      await adminClient.deleteConversation(username, sessionId, token);
      setShowDeleteDialog(false);
      onDelete();
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const sessionTimestamp = messages.length > 0
    ? new Date(messages[messages.length - 1].message_timestamp)
    : null;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to list</span>
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
              {sessionTimestamp && (
                <p className="text-sm text-slate-600">
                  {format(sessionTimestamp, 'MMMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">No messages found</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble key={`${message.message_timestamp}-${index}`} message={message} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and
              all messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
