import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth';
import { UserMenu } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AITaskLogger } from '@/components/tasks/AITaskLogger';
import { TaskTable } from '@/components/tasks/TaskTable';
import { mcpClient, Task } from '@/lib/api/mcp-client';
import { useAuthStore } from '@/stores/auth-store';

function DashboardContent() {
  const { token, user } = useAuthStore();
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedToday: 0,
    hoursThisWeek: 0,
  });

  // Combined effect: set token and fetch tasks when token or filter changes
  useEffect(() => {
    if (token) {
      mcpClient.setToken(token);

      const fetchTasks = async () => {
        setIsLoadingTasks(true);
        setError(null);
        try {
          const filters: any = {
            limit: 50,
          };

          // Filter by current user unless "show all" is enabled
          if (!showAllTasks && user?.username) {
            filters.user_name = user.username;
          }

          const fetchedTasks = await mcpClient.getTasks(filters);
          setTasks(fetchedTasks);
          calculateMetrics(fetchedTasks);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks. Please try again.';
          setError(errorMessage);
          setTasks([]);
          setMetrics({
            totalTasks: 0,
            completedToday: 0,
            hoursThisWeek: 0,
          });
        } finally {
          setIsLoadingTasks(false);
        }
      };

      fetchTasks();
    } else {
      // Clear tasks if token is removed (logout)
      setTasks([]);
      setIsLoadingTasks(false);
    }
  }, [token, showAllTasks, user?.username]);

  // Standalone fetchTasks for manual refresh button
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setError(null);
    try {
      const filters: any = {
        limit: 50,
      };

      // Filter by current user unless "show all" is enabled
      if (!showAllTasks && user?.username) {
        filters.user_name = user.username;
      }

      const fetchedTasks = await mcpClient.getTasks(filters);
      setTasks(fetchedTasks);
      calculateMetrics(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks. Please try again.';
      setError(errorMessage);
      setTasks([]);
      setMetrics({
        totalTasks: 0,
        completedToday: 0,
        hoursThisWeek: 0,
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const calculateMetrics = (taskList: Task[]) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Calculate start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const totalTasks = taskList.length;

    const completedToday = taskList.filter(
      (task) =>
        task.status === 'completed' &&
        task.task_date === today
    ).length;

    const hoursThisWeek = taskList
      .filter((task) => {
        const taskDate = new Date(task.task_date);
        return taskDate >= startOfWeek && taskDate <= now;
      })
      .reduce((sum, task) => sum + (task.actual_hours || 0), 0);

    setMetrics({
      totalTasks,
      completedToday,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    });
  };

  const handleTaskLogged = () => {
    // Refresh tasks when AI logs a new one
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">Task Logger</h1>
            </div>
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section with Inline AI Input */}
        <div className="mb-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Dashboard</h2>
            <p className="text-slate-600 mb-6">
              Track your work effortlessly with AI-powered task logging
            </p>

            {/* Quick Add Input */}
            <button
              onClick={() => setIsAIDialogOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  Tell me what you worked on... (e.g., &apos;Spent 3 hours on Acme Corp website&apos;)
                </span>
              </div>
              <div className="text-xs text-slate-400 group-hover:text-primary transition-colors font-medium">
                AI
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTasks}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedToday}</div>
              <p className="text-xs text-muted-foreground">Tasks finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.hoursThisWeek}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Table */}
        <TaskTable
          tasks={tasks}
          isLoading={isLoadingTasks}
          onRefresh={fetchTasks}
          showAllTasks={showAllTasks}
          onToggleFilter={setShowAllTasks}
          currentUser={user?.username}
        />
      </main>

      {/* AI Task Logger Dialog */}
      <AITaskLogger
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onTaskLogged={handleTaskLogged}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
