import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasHydrated: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      hasHydrated: false,

      setAuth: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        });
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          get().clearAuth();
          return false;
        }

        try {
          // Import authClient dynamically to avoid circular dependencies
          const { authClient } = await import('@/lib/api/auth-client');
          const valid = await authClient.verifyToken(token);
          if (!valid) {
            get().clearAuth();
            return false;
          }
          return true;
        } catch {
          get().clearAuth();
          return false;
        }
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      version: 1, // Increment this to force localStorage clear on all clients
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      migrate: (persistedState: any, version: number) => {
        // Migrate from older versions
        if (version < 1) {
          console.log('[auth-store] Migrating localStorage from version', version, 'to version 1');

          // If persistedState exists and has valid-looking data, preserve it
          // Only clear if data looks corrupted (missing required fields or invalid types)
          if (persistedState && typeof persistedState === 'object') {
            const hasToken = typeof persistedState.token === 'string' || persistedState.token === null;
            const hasUser = typeof persistedState.user === 'object' || persistedState.user === null;

            // If structure looks valid, preserve it and just update version
            if (hasToken && hasUser) {
              console.log('[auth-store] Preserving existing auth data during migration');
              return {
                ...persistedState,
                hasHydrated: false, // Reset hydration flag
              };
            }
          }

          // Only clear if data is corrupted or doesn't exist
          console.log('[auth-store] Clearing corrupted localStorage data');
          return {
            token: null,
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            hasHydrated: false,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Set hasHydrated to true after rehydration completes
        state?.setHasHydrated(true);
      },
    }
  )
);
