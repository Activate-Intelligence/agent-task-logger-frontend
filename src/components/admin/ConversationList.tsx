import { useMemo } from 'react';
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  differenceInDays,
} from 'date-fns';
import { Loader2, MessageSquareOff } from 'lucide-react';
import { ConversationCard } from './ConversationCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ConversationSession } from '@/types/conversation.types';

interface ConversationListProps {
  username: string;
  conversations: ConversationSession[];
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
  isLoading: boolean;
}

type GroupedConversations = {
  [key: string]: ConversationSession[];
};

export function ConversationList({
  username,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  isLoading,
}: ConversationListProps) {
  // Group conversations by time period
  const groupedConversations = useMemo(() => {
    const groups: GroupedConversations = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'This Month': [],
      Older: [],
    };

    conversations.forEach((session) => {
      const date = new Date(session.last_message_at);

      if (isToday(date)) {
        groups.Today.push(session);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(session);
      } else if (isThisWeek(date, { weekStartsOn: 1 })) {
        groups['This Week'].push(session);
      } else if (isThisMonth(date)) {
        groups['This Month'].push(session);
      } else {
        groups.Older.push(session);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, sessions]) => sessions.length > 0)
    );
  }, [conversations]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (conversations.length === 0) {
      return { totalConversations: 0, daysCovered: 0, totalMessages: 0 };
    }

    const dates = conversations.map((s) => new Date(s.last_message_at));
    const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const daysCovered = differenceInDays(startOfDay(newestDate), startOfDay(oldestDate)) + 1;
    const totalMessages = conversations.reduce((sum, s) => sum + s.message_count, 0);

    return {
      totalConversations: conversations.length,
      daysCovered,
      totalMessages,
    };
  }, [conversations]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquareOff className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No conversations found</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          User "{username}" has no conversation history yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Conversation Statistics</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-600">Total Conversations:</span>{' '}
            <span className="font-semibold text-slate-900">{stats.totalConversations}</span>
          </div>
          <div>
            <span className="text-slate-600">Total Messages:</span>{' '}
            <span className="font-semibold text-slate-900">{stats.totalMessages}</span>
          </div>
          <div>
            <span className="text-slate-600">Days Covered:</span>{' '}
            <span className="font-semibold text-slate-900">{stats.daysCovered}</span>
          </div>
        </div>
      </div>

      {/* Grouped Conversations */}
      {Object.entries(groupedConversations).map(([group, sessions]) => (
        <div key={group} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {group}
          </h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <ConversationCard
                key={session.session_id}
                session={session}
                onSelect={() => onSelectConversation(session.session_id)}
                onDelete={() => onDeleteConversation(session.session_id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
