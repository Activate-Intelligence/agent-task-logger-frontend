import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  headerActions?: ReactNode;
  maxWidth?: 'default' | 'narrow';
}

export function AppLayout({
  children,
  pageTitle,
  pageDescription,
  headerActions,
  maxWidth = 'default',
}: AppLayoutProps) {
  const containerClass = maxWidth === 'narrow' ? 'max-w-4xl' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className={`mx-auto ${containerClass} px-4 py-8 sm:px-6 lg:px-8`}>
        {(pageTitle || headerActions) && (
          <div className="mb-8 flex items-center justify-between">
            <div>
              {pageTitle && (
                <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
              )}
              {pageDescription && (
                <p className="mt-2 text-sm text-slate-600">{pageDescription}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
