import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from './AuthGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration before checking admin status
    if (!hasHydrated) return;

    if (!isLoading && !isAdmin) {
      // Redirect to dashboard if not admin - use replace to avoid back button loop
      navigate('/dashboard', { replace: true });
    }
  }, [hasHydrated, isAdmin, isLoading, navigate]);

  return (
    <AuthGuard>
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Checking permissions...
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="flex h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              You do not have permission to access this page. Admin privileges are required.
            </AlertDescription>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              Go to Dashboard
            </Button>
          </Alert>
        </div>
      ) : (
        <>{children}</>
      )}
    </AuthGuard>
  );
}
