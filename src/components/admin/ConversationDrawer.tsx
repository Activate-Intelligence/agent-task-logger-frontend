import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConversationList } from './ConversationList';
import { ConversationViewer } from './ConversationViewer';
import { adminClient } from '@/lib/api/admin-client';
import { useAuthStore } from '@/stores/auth-store';
import type { ConversationSession } from '@/types/conversation.types';

interface ConversationDrawerProps {
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationDrawer({ username, isOpen, onClose }: ConversationDrawerProps) {
  const { token } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Fetch conversations when drawer opens
  useEffect(() => {
    if (!isOpen || !username || !token) {
      return;
    }

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = await adminClient.getConversations(username, token);
        setConversations(data);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isOpen, username, token]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSessionId(null);
      setConversations([]);
    }
  }, [isOpen]);

  const handleSelectConversation = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleBack = () => {
    setSelectedSessionId(null);
  };

  const handleDeleteConversation = async (sessionId: string) => {
    if (!username || !token) return;

    try {
      await adminClient.deleteConversation(username, sessionId, token);

      // If we're viewing the deleted conversation, go back to list
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }

      // Refresh the conversation list
      const data = await adminClient.getConversations(username, token);
      setConversations(data);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleDeleteFromViewer = () => {
    // Go back to list after deletion
    setSelectedSessionId(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-3/4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {selectedSessionId ? 'Conversation Details' : 'User Conversations'}
          </SheetTitle>
          <SheetDescription>
            {username
              ? selectedSessionId
                ? 'View message history for this conversation'
                : `Viewing conversation history for ${username}`
              : 'Select a user to view conversations'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 h-[calc(100vh-8rem)] overflow-hidden">
          {!username ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-500">No user selected</p>
            </div>
          ) : selectedSessionId ? (
            <ConversationViewer
              username={username}
              sessionId={selectedSessionId}
              onBack={handleBack}
              onDelete={handleDeleteFromViewer}
            />
          ) : (
            <ConversationList
              username={username}
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              isLoading={isLoading}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
