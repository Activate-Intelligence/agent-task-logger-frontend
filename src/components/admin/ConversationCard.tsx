import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ConversationSession } from '@/types/conversation.types';

interface ConversationCardProps {
  session: ConversationSession;
  onSelect: () => void;
  onDelete: () => void;
}

export function ConversationCard({ session, onSelect, onDelete }: ConversationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const timestamp = new Date(session.last_message_at);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <Card className="hover:bg-slate-50 transition-colors cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0" onClick={onSelect}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900">
                  {format(timestamp, 'MMM d, yyyy h:mm a')}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {session.message_count} {session.message_count === 1 ? 'message' : 'messages'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 truncate">
                Session ID: {session.session_id.substring(0, 8)}...
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3 w-3" />
                <span className="sr-only">View conversation</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete conversation</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
