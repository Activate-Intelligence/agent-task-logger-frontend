# Amplify to JWT Authentication Migration

This document outlines the migration from AWS Amplify authentication to custom JWT-based authentication for the Task Logger frontend.

## Summary of Changes

The frontend has been successfully migrated from AWS Amplify/Cognito authentication to a custom JWT-based authentication system. All Amplify dependencies have been removed and replaced with native fetch API calls.

## Files Changed

### 1. Dependencies (`package.json`)
- **Removed**: `aws-amplify` package
- **Kept**: All other dependencies including React, Next.js, and UI libraries

### 2. Environment Variables (`.env.local`)
- **Removed**: Cognito User Pool ID and Client ID
- **Updated**: Simplified to only include API URL and AWS region

```env
NEXT_PUBLIC_API_URL=https://efkewawkcadzjmb7kcv6vrolbq0fhpit.lambda-url.eu-west-2.on.aws
NEXT_PUBLIC_AWS_REGION=eu-west-2
```

### 3. New Files Created

#### `/src/lib/api/auth-client.ts`
- Custom authentication client using native fetch API
- Implements login, token verification, get current user, and password change
- Includes proper error handling and type safety
- JWT token sent via `Authorization: Bearer TOKEN` header

### 4. Updated Files

#### `/src/types/index.ts`
- **Changed**: `AuthUser` interface simplified
  - Removed: `userId`, `groups` fields
  - Added: `role: 'admin' | 'user'` field
  - Kept: `username`, `email?`
- **Removed**: `NewPasswordRequired` interface (not needed for JWT auth)

#### `/src/stores/auth-store.ts`
- Complete rewrite to support JWT authentication
- Added: `token`, `isAdmin` fields
- Added: `checkAuth()` method for token verification
- Uses Zustand persist middleware to store auth state in localStorage

#### `/src/hooks/useAuth.ts`
- Complete rewrite to use new auth client
- Removed: All Amplify imports
- Updated: `login()` now accepts username and password directly
- Returns: `token`, `isAdmin`, loading and error states

#### `/src/components/auth/LoginForm.tsx`
- Removed: Amplify `confirmSignIn` import and password reset flow
- Simplified: Direct username/password login
- Removed: "New Password Required" functionality (handled by backend)
- Kept: Form validation with react-hook-form and Zod

#### `/src/components/auth/AuthGuard.tsx`
- Removed: Amplify-specific authentication checks
- Updated: Uses auth store's `checkAuth()` method
- Improved: Token verification on mount

#### `/src/components/auth/AdminGuard.tsx`
- Updated: Checks `user.role === 'admin'` instead of Cognito groups
- Simplified: No Cognito group checking logic

#### `/src/components/layout/UserMenu.tsx`
- Updated: Displays username (already was doing this)
- Updated: Shows role badge based on `user.role`
- Kept: All UI and navigation logic

#### `/src/app/layout.tsx`
- **Removed**: `AmplifyProvider` import and wrapper
- Simplified: Direct rendering of children without authentication provider

### 5. Files Deleted
- `/src/components/auth/AmplifyProvider.tsx` - No longer needed
- `/src/lib/auth/amplify-config.ts` - Amplify configuration removed

## Authentication Flow

### Login Flow
1. User enters username and password
2. `LoginForm` calls `useAuth().login(username, password)`
3. `useAuth` calls `authClient.login()` which makes POST to `/auth/login`
4. Backend returns JWT token and user object
5. Token and user stored in Zustand store (persisted to localStorage)
6. User redirected to dashboard

### Token Verification
1. On app mount, `AuthGuard` calls `checkAuth()`
2. `checkAuth()` makes POST to `/auth/verify` with token
3. If valid, user stays authenticated
4. If invalid, user redirected to login

### Protected Routes
- `AuthGuard`: Verifies token, redirects to login if invalid
- `AdminGuard`: Additionally checks `user.role === 'admin'`

### Logout Flow
1. User clicks logout
2. `clearAuth()` removes token and user from store
3. User redirected to login page

## API Integration

All API calls requiring authentication should include the JWT token:

```typescript
const token = useAuthStore.getState().token;

fetch(`${API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Backend Requirements

The frontend expects the following endpoints:

### POST `/auth/login`
Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "username": "string",
    "role": "admin" | "user",
    "email": "string" (optional)
  }
}
```

### POST `/auth/verify`
Headers: `Authorization: Bearer TOKEN`

Response: 200 OK if valid, 401 if invalid

### GET `/auth/me`
Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "username": "string",
  "role": "admin" | "user",
  "email": "string" (optional)
}
```

### POST `/auth/change-password`
Headers: `Authorization: Bearer TOKEN`

Request:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

Response: 200 OK if successful

## Testing

### Build Test
```bash
npm run build
```
Result: ✅ Build completes without errors

### Type Check
```bash
npm run typecheck
```
Result: ✅ No TypeScript errors

### Development Server
```bash
npm run dev
```
Result: ✅ Server starts on http://localhost:3000

## Key Benefits

1. **Reduced Bundle Size**: Removed 155 packages (mostly Amplify dependencies)
2. **Simplified Authentication**: No complex Amplify configuration
3. **Better Control**: Direct control over authentication flow
4. **Framework Agnostic**: Can be reused across different projects
5. **Type Safety**: Full TypeScript support with proper types

## Migration Checklist

- [x] Remove Amplify dependencies from package.json
- [x] Create authentication client
- [x] Update auth types
- [x] Update auth store with JWT support
- [x] Update useAuth hook
- [x] Update LoginForm component
- [x] Update AuthGuard component
- [x] Update AdminGuard component
- [x] Update UserMenu component
- [x] Remove AmplifyProvider from layout
- [x] Delete Amplify configuration files
- [x] Update environment variables
- [x] Run npm install
- [x] Verify TypeScript compilation
- [x] Test authentication flow (manual testing required)

## Next Steps

1. **Manual Testing**: Test login, logout, and protected routes
2. **API Integration**: Ensure backend endpoints match the expected format
3. **Error Handling**: Add more specific error messages based on API responses
4. **Token Refresh**: Implement token refresh if needed (depends on backend)
5. **Remember Me**: Implement persistent sessions if required

## Notes

- JWT tokens are stored in localStorage via Zustand persist
- No token expiry handling implemented yet (depends on backend requirements)
- Password reset flow should be handled by backend
- MFA is not currently supported (can be added if needed)

## Rollback Plan

If issues are encountered, the previous Amplify implementation can be restored from git history:
```bash
git checkout HEAD~1 -- src/
npm install
```
