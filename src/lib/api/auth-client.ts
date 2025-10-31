interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    username: string;
    role: 'admin' | 'user';
    email?: string;
  };
}

interface User {
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

export class AuthClient {
  private baseUrl: string;

  constructor() {
    // Normalize URL by removing trailing slashes to prevent double-slash issues
    this.baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    // Don't throw during build time (SSG), only validate at runtime
    if (typeof window !== 'undefined' && !this.baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Password change failed' }));
      throw new Error(error.message || 'Password change failed');
    }
  }
}

export const authClient = new AuthClient();
