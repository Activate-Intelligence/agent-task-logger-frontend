# Authentication Setup Documentation

## Overview

This frontend implements AWS Amplify v6 authentication with username-based login (not email-based) connected to AWS Cognito.

## Architecture

### Components Structure

```
src/
├── lib/
│   └── auth/
│       └── amplify-config.ts          # Amplify configuration
├── stores/
│   └── auth-store.ts                  # Zustand auth state management
├── hooks/
│   └── useAuth.ts                     # Auth hook with Amplify functions
├── components/
│   ├── auth/
│   │   ├── AmplifyProvider.tsx       # Client-side Amplify initializer
│   │   ├── AuthGuard.tsx             # Protected route wrapper
│   │   ├── AdminGuard.tsx            # Admin-only route wrapper
│   │   ├── LoginForm.tsx             # Login form with validation
│   │   └── index.ts                  # Barrel export
│   └── layout/
│       ├── UserMenu.tsx              # User dropdown menu
│       └── index.ts                  # Barrel export
└── types/
    └── index.ts                       # TypeScript interfaces
```

## Configuration

### Environment Variables

Located in `.env.local`:

```env
NEXT_PUBLIC_AWS_REGION=eu-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-2_BP2e3YQZA
NEXT_PUBLIC_COGNITO_CLIENT_ID=5607f1nnm8kqnfv9iffs83bnqi
NEXT_PUBLIC_API_URL=https://efkewawkcadzjmb7kcv6vrolbq0fhpit.lambda-url.eu-west-2.on.aws
```

### Cognito Configuration

- **Authentication Method**: Username + Password (NOT email)
- **User Pool**: `eu-west-2_BP2e3YQZA`
- **Region**: `eu-west-2`
- **Groups**: Admin, User

## Key Features

### 1. Username-Based Authentication

Users login with username (not email):
- Username field in login form
- No email validation on frontend
- Supports first-login password change flow

### 2. Role-Based Access Control

Admin detection via Cognito groups:
```typescript
const groups = (idToken?.payload['cognito:groups'] as string[]) || [];
const isAdmin = groups.includes('Admin') || groups.includes('admin');
```

### 3. Persistent Auth State

Using Zustand with persistence:
- Auth state survives page refreshes
- Stored in localStorage
- Auto-revalidates on mount

### 4. Route Protection

Two levels of guards:
- `AuthGuard`: Requires authentication
- `AdminGuard`: Requires Admin group membership

### 5. New Password Flow

Handles first-login scenario:
- Detects `CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED`
- Shows password requirements
- Validates password complexity
- Automatically logs in after password change

## Usage Examples

### Protect a Page

```tsx
import { AuthGuard } from '@/components/auth';

export default function MyPage() {
  return (
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

### Protect Admin Page

```tsx
import { AdminGuard } from '@/components/auth';

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>Admin-only content</div>
    </AdminGuard>
  );
}
```

### Use Auth in Component

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      {isAdmin && <p>You are an admin</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Add User Menu to Layout

```tsx
import { UserMenu } from '@/components/layout';

export function Header() {
  return (
    <nav>
      <h1>My App</h1>
      <UserMenu />
    </nav>
  );
}
```

## Authentication Flow

### Login Flow

1. User enters username + password
2. `useAuth.login()` calls Amplify `signIn()`
3. If successful:
   - Fetch user details with `getCurrentUser()`
   - Extract groups from JWT token
   - Store in Zustand
   - Redirect to dashboard
4. If new password required:
   - Show new password form
   - Call `confirmSignIn()` with new password
   - Complete login flow

### Session Management

1. On app mount: `useAuth` checks authentication
2. Calls `getCurrentUser()` to validate session
3. Fetches JWT token to extract groups
4. Updates auth store with user data
5. If error, clears auth state (user logged out)

### Logout Flow

1. User clicks logout in UserMenu
2. Calls `useAuth.logout()`
3. Amplify `signOut()` invalidates session
4. Clear Zustand store
5. Redirect to login page

## TypeScript Types

### AuthUser

```typescript
interface AuthUser {
  username: string;
  userId: string;
  email?: string;
  groups: string[];
  isAdmin: boolean;
}
```

### LoginCredentials

```typescript
interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
```

## Password Requirements

Enforced by Cognito and validated on frontend:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

## Error Handling

Common errors handled:
- Invalid credentials
- User not found
- Network errors
- Session expired
- Password requirements not met
- Account locked/disabled

## Security Considerations

1. **No credentials in code**: All config via env variables
2. **Token auto-refresh**: Handled by Amplify SDK
3. **Secure session storage**: Uses httpOnly cookies when available
4. **CSRF protection**: Built into Amplify
5. **XSS protection**: React escapes all content by default

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] First-time login (new password required)
- [ ] Password validation (complexity rules)
- [ ] Remember me functionality
- [ ] Logout functionality
- [ ] Session persistence across page refresh
- [ ] Protected route access (logged out)
- [ ] Protected route access (logged in)
- [ ] Admin route access (non-admin user)
- [ ] Admin route access (admin user)
- [ ] User menu displays correctly
- [ ] Groups/roles display correctly
- [ ] Token refresh on expiry

## Troubleshooting

### "User is not authenticated"
- Check `.env.local` variables are set
- Verify Cognito User Pool ID and Client ID
- Check browser console for Amplify errors

### Login succeeds but redirects to login
- Check `checkAuth()` is being called
- Verify JWT token contains expected groups
- Check Zustand store persistence

### Admin guard not working
- Verify user is in "Admin" Cognito group
- Check JWT payload includes `cognito:groups`
- Console log `user.groups` to debug

### Password change fails
- Verify password meets all requirements
- Check Cognito password policy settings
- Look for specific error in catch block

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Social login providers
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Profile management
- [ ] Session timeout warning
- [ ] Audit logging
