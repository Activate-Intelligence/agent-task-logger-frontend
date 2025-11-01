import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/conversation.types';

interface MessageBubbleProps {
  message: ConversationMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.message_timestamp);

  return (
    <div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 shadow-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-slate-500 mt-1 px-1">
          {format(timestamp, 'MMM d, yyyy h:mm a')}
        </span>
      </div>
    </div>
  );
}
