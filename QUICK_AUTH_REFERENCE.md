# Quick Authentication Reference

## Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_AWS_REGION=eu-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-2_BP2e3YQZA
NEXT_PUBLIC_COGNITO_CLIENT_ID=5607f1nnm8kqnfv9iffs83bnqi
NEXT_PUBLIC_API_URL=https://efkewawkcadzjmb7kcv6vrolbq0fhpit.lambda-url.eu-west-2.on.aws
```

## Common Code Snippets

### Protect a Route
```tsx
import { AuthGuard } from '@/components/auth';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* Your protected content */}
    </AuthGuard>
  );
}
```

### Admin-Only Route
```tsx
import { AdminGuard } from '@/components/auth';

export default function AdminPage() {
  return (
    <AdminGuard>
      {/* Admin-only content */}
    </AdminGuard>
  );
}
```

### Get Current User
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;

  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>User ID: {user?.userId}</p>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
      <p>Groups: {user?.groups.join(', ')}</p>
    </div>
  );
}
```

### Manual Login
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export function CustomLoginButton() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        username: 'myusername',
        password: 'mypassword',
        rememberMe: true,
      });
      // Success - user is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Manual Logout
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Add User Menu to Layout
```tsx
import { UserMenu } from '@/components/layout';

export function Navigation() {
  return (
    <nav className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <UserMenu />
    </nav>
  );
}
```

### Conditional Rendering Based on Role
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export function ConditionalContent() {
  const { isAdmin } = useAuth();

  return (
    <div>
      <p>Everyone sees this</p>
      {isAdmin && <p>Only admins see this</p>}
    </div>
  );
}
```

### Check Auth Before Action
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export function DeleteButton({ itemId }: { itemId: string }) {
  const { isAdmin, user } = useAuth();

  const handleDelete = async () => {
    if (!isAdmin) {
      alert('Only admins can delete items');
      return;
    }

    // Proceed with deletion
    await deleteItem(itemId);
  };

  return (
    <button onClick={handleDelete} disabled={!isAdmin}>
      Delete
    </button>
  );
}
```

### Redirect After Login
```tsx
// In your protected page component
import { useRouter, useSearchParams } from 'next/navigation';

export function ProtectedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // AuthGuard automatically adds returnUrl to login redirect
  // After successful login, user is redirected back here

  return <div>Protected content</div>;
}
```

### Access User Store Directly
```tsx
'use client';
import { useAuthStore } from '@/stores/auth-store';

export function DirectStoreAccess() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  // Direct access to store (use useAuth hook instead when possible)
  return <div>Username: {user?.username}</div>;
}
```

## TypeScript Types

### AuthUser
```typescript
interface AuthUser {
  username: string;      // Cognito username
  userId: string;        // Cognito user ID (sub)
  email?: string;        // User's email (optional)
  groups: string[];      // Cognito groups
  isAdmin: boolean;      // True if user in Admin group
}
```

### LoginCredentials
```typescript
interface LoginCredentials {
  username: string;      // Username (not email)
  password: string;      // User's password
  rememberMe?: boolean;  // Optional flag for extended session
}
```

## File Locations

### Core Files
- **Config**: `src/lib/auth/amplify-config.ts`
- **Store**: `src/stores/auth-store.ts`
- **Hook**: `src/hooks/useAuth.ts`

### Components
- **Guards**: `src/components/auth/AuthGuard.tsx`, `AdminGuard.tsx`
- **Forms**: `src/components/auth/LoginForm.tsx`
- **Layout**: `src/components/layout/UserMenu.tsx`

### Pages
- **Login**: `src/app/login/page.tsx`
- **Dashboard**: `src/app/dashboard/page.tsx` (example protected route)

## Common Issues

### User keeps getting logged out
- Check if Cognito session is valid
- Verify token refresh is working
- Check browser localStorage for `auth-storage` key

### Admin guard redirects admin users
- Verify user is in "Admin" Cognito group (case-sensitive)
- Check JWT token includes `cognito:groups` claim
- Console log `user.groups` to debug

### Login succeeds but no redirect
- Check `returnUrl` in searchParams
- Verify router.push() is being called
- Check for JavaScript errors in console

### New password form not showing
- Verify Cognito is set to require password change on first login
- Check `result.nextStep.signInStep` value
- Ensure user status is `FORCE_CHANGE_PASSWORD` in Cognito

## Dev Commands

```bash
# Type checking
npm run typecheck

# Build for production
npm run build

# Start dev server
npm run dev

# Start production server
npm start
```

## Testing Credentials

Create test users in AWS Cognito console:
1. Go to User Pool: `eu-west-2_BP2e3YQZA`
2. Create user with username + temporary password
3. Assign to "Admin" or "User" group
4. User will be prompted to change password on first login

## Support Resources

- **Full Documentation**: `AUTH_SETUP.md`
- **Implementation Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Amplify Docs**: https://docs.amplify.aws/
- **Cognito Console**: https://console.aws.amazon.com/cognito/
