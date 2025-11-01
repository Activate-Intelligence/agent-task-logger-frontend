import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, hasHydrated, checkAuth, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (!hasHydrated) {
      console.log('[AuthGuard] Waiting for store to hydrate...');
      return;
    }

    const verifyAuth = async () => {
      console.log('[AuthGuard] Starting auth verification', {
        hasToken: !!token,
        isAuthenticated
      });

      // If no token, redirect immediately
      if (!token) {
        console.log('[AuthGuard] No token found, redirecting to login');
        setIsChecking(false);
        navigate('/', { replace: true });
        return;
      }

      // Always verify token with server (don't trust localStorage alone)
      setIsChecking(true);
      try {
        const valid = await checkAuth();
        console.log('[AuthGuard] Token verification result:', valid);

        if (!valid) {
          // Token is invalid or expired, redirect to login
          console.log('[AuthGuard] Invalid token, redirecting to login');
          navigate('/', { replace: true });
        } else {
          console.log('[AuthGuard] Authentication successful');
        }
      } catch (error) {
        console.error('[AuthGuard] Error during auth check:', error);
        navigate('/', { replace: true });
      }

      setIsChecking(false);
    };

    verifyAuth();
  }, [hasHydrated, token, navigate, checkAuth, isAuthenticated]);

  // Show loading state while hydrating or checking
  if (!hasHydrated || isChecking) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="space-y-4 w-full max-w-md px-4">
            <div className="text-center mb-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                {!hasHydrated ? 'Loading...' : 'Verifying authentication...'}
              </p>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )
    );
  }

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
