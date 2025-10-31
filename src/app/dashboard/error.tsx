'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to help diagnose white screen issues
    console.error('[Dashboard Error Boundary]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // Log localStorage state for debugging
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        console.error('[Dashboard Error] localStorage auth-storage:', authStorage);
      } catch (e) {
        console.error('[Dashboard Error] Failed to read localStorage:', e);
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Something went wrong
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            The dashboard encountered an error. This might be due to corrupted browser data.
          </p>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs font-mono text-slate-700 break-all">
              {error.message}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              Try Again
            </Button>

            <Button
              onClick={() => {
                // Clear localStorage and reload
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }
              }}
              className="w-full"
              variant="outline"
            >
              Clear Data & Return to Login
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            If this problem persists, please contact support with the error message above.
          </p>
        </div>
      </div>
    </div>
  );
}
