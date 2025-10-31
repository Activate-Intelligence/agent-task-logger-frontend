'use client';

import { useAuthStore } from '@/stores/auth-store';
import { authClient } from '@/lib/api/auth-client';
import { useState } from 'react';

export function useAuth() {
  const { token, user, isAuthenticated, isAdmin, setAuth, clearAuth, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.login(username, password);
      setAuth(response.token, response.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }
      await authClient.changePassword(token, oldPassword, newPassword);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoading: loading,
    error,
    login,
    logout,
    checkAuth,
    changePassword,
  };
}
