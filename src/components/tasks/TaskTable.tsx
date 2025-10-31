'use client';

import { Task } from '@/lib/api/mcp-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, ListTodo, User, Users } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
  showAllTasks: boolean;
  onToggleFilter: (showAll: boolean) => void;
  currentUser?: string;
}

export function TaskTable({ tasks, isLoading, onRefresh, showAllTasks, onToggleFilter, currentUser }: TaskTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Recent Tasks
          </CardTitle>
          <CardDescription>Loading your logged tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
              <CardDescription>
                {showAllTasks ? 'All users' : `${currentUser}'s`} tasks will appear here
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={showAllTasks ? "all" : "mine"}
                onValueChange={(value) => onToggleFilter(value === "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Tasks
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Tasks
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ListTodo className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-2">No tasks logged yet</p>
            <p className="text-sm text-slate-500">
              Use the AI input above to log your first task
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              {!showAllTasks && currentUser && ` for ${currentUser}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={showAllTasks ? "all" : "mine"}
              onValueChange={(value) => onToggleFilter(value === "all")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Tasks
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Tasks
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.task_id}>
                <TableCell className="font-medium">{task.client_name}</TableCell>
                <TableCell>{task.project_name}</TableCell>
                <TableCell className="text-slate-600">{task.user_name}</TableCell>
                <TableCell className="max-w-md truncate">{task.task_description}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(task.task_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {task.actual_hours ? `${task.actual_hours}h` : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.status === 'completed'
                        ? 'default'
                        : task.status === 'in_progress'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      task.status === 'completed' ? 'bg-green-600' : ''
                    }
                  >
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
