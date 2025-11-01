# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Run Vite dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

### Terraform Deployment
```bash
cd terraform

# Initialize (replace environment: dev/prod)
terraform init \
  -backend-config="region=eu-west-2" \
  -backend-config="bucket=533267084389-tf-state" \
  -backend-config="key=aws/{environment}/agents/agent-task-logger-frontend"

# Deploy (replace environment: dev/prod)
terraform apply \
  -var="s3_bucket=533267084389-lambda-artifacts" \
  -var="s3_prefix=agent-task-logger-frontend/{environment}/" \
  -var="environment={environment}"
```

## Architecture Overview

### Tech Stack
- **Vite 5** - Modern build tool and dev server
- **React 18.3** - UI library
- **React Router v6** - Client-side routing
- **shadcn/ui** + **Radix UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Client state management
- **React Hook Form** + **Zod** - Forms and validation
- **TypeScript** - Type safety

### AWS Infrastructure
The application deploys as a static React SPA using:
- **S3**: Static assets (index.html, JS, CSS bundles)
- **CloudFront**: CDN with SPA routing (404 → index.html)
- **No Lambda** - Pure static site
- **No DynamoDB** - No server-side caching
- **No SQS** - No server-side queues

### API Communication Pattern
The frontend communicates with the backend Task Logger API using two client patterns:

1. **AuthClient** (`src/lib/api/auth-client.ts`): Traditional REST API
   - Login, token verification, password change
   - Uses `Authorization: Bearer {token}` headers

2. **MCPClient** (`src/lib/api/mcp-client.ts`): Model Context Protocol (MCP) wrapper
   - Task operations (log, get, update, delete)
   - Report generation
   - Sends MCP-formatted JSON-RPC requests to `/mcp` endpoint
   - Backend translates to actual MCP server calls

**Important**: All API calls go through `VITE_API_URL` environment variable.

### Authentication Flow
- **Zustand store** (`src/stores/auth-store.ts`) manages auth state with localStorage persistence
- **Client-side only**: Store uses localStorage, hydrates on mount
- **Migration system**: Version-based localStorage migrations to handle schema changes
- Token stored in localStorage, sent as Bearer token in API requests
- Auth state includes: `token`, `user`, `isAuthenticated`, `isAdmin`

### State Management Patterns
- **Zustand**: Client-side state (auth, UI state)
  - Uses `persist` middleware for localStorage
  - Client-side only with `hasHydrated` flag
- **TanStack Query**: Server state (optional - not currently used heavily)
  - Can be used for fetching/updating tasks with caching

## Key Architectural Patterns

### Component Structure
```
src/
├── main.tsx                # React root entry point
├── App.tsx                 # React Router setup
├── routes/                 # Route components (pages)
│   ├── LandingPage.tsx     # Login page
│   ├── DashboardPage.tsx   # Main dashboard
│   ├── SettingsPage.tsx    # User settings
│   └── AdminPage.tsx       # Admin panel
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Dialog, etc.)
│   ├── auth/               # Auth-related components
│   │   ├── AuthGuard.tsx   # Protected route wrapper
│   │   ├── AdminGuard.tsx  # Admin-only route wrapper
│   │   └── LoginForm.tsx   # Login form
│   ├── tasks/              # Task-specific components
│   │   ├── AITaskLogger.tsx    # AI-powered task logging UI
│   │   └── TaskTable.tsx       # Task list/table
│   ├── layout/             # Layout components
│   │   └── UserMenu.tsx    # User dropdown menu
│   └── providers/          # React context providers
├── lib/
│   ├── api/                # API clients
│   │   ├── auth-client.ts      # Authentication API
│   │   └── mcp-client.ts       # MCP protocol wrapper
│   └── utils.ts            # General utilities (cn, etc.)
├── stores/                 # Zustand stores
│   └── auth-store.ts       # Global auth state
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Auth helper hook
│   └── use-toast.ts        # Toast notifications
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types (Task, API responses)
```

### Environment Variables
**Build-time** (must be prefixed with `VITE_`):
- `VITE_API_URL`: Backend API URL (e.g., Lambda Function URL)
- `VITE_AWS_REGION`: AWS region (eu-west-2)
- `VITE_ENVIRONMENT`: Environment (dev/prod)

**Accessing in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

### Deployment Pipeline
GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. **Branch → Environment mapping**:
   - `main` → dev environment
   - `prod*` → prod environment
2. **Build**: `npm run build` creates `dist/` directory
3. **Upload**: S3 sync (HTML/assets with different cache policies)
4. **Deploy**: Terraform applies CloudFront + S3 configuration
5. **Invalidate**: CloudFront cache invalidation
6. **Outputs**: Frontend URL, CloudFront distribution ID

### Build Output Structure
```
dist/
├── index.html              # Main HTML entry
└── assets/                 # Hashed JS/CSS bundles
    ├── index-[hash].js     # Main JS bundle
    └── index-[hash].css    # Main CSS bundle
```

## Development Guidelines

### Working with API Clients
When adding new API endpoints:
1. **Auth operations**: Add to `AuthClient` class
2. **Task/MCP operations**: Add to `MCPClient` class
3. Always handle errors and parse MCP text responses (JSON extraction pattern)
4. Set token with `mcpClient.setToken(token)` after login

### Working with Forms
- Use **React Hook Form** with **Zod** schemas for validation
- shadcn/ui form components integrate with RHF
- Example: Task forms use `@hookform/resolvers/zod`

### Working with Tasks
- Task types: `completed`, `daily`, `future`
- Task status: `completed`, `in_progress`, `pending`
- Primary keys: `task_id` + `client_name` + `project_name`
- Date fields: `task_date` (when task occurs), `date_logged` (when logged)

### shadcn/ui Components
UI components are in `src/components/ui/`. These are NOT npm packages - they're copied source files that can be modified. To add new shadcn components, copy from shadcn/ui documentation.

### Styling
- **Tailwind CSS** with `tailwind-merge` (`cn()` utility)
- Theme: See `src/app/globals.css` for CSS variables
- Dark mode: Not currently implemented

### TypeScript
- Strict type checking enabled
- Shared types in `src/types/index.ts`
- API response types: `ApiResponse<T>` wrapper

## Important Implementation Notes

### Client-Side State
- Zustand store is client-side only with `hasHydrated` flag
- Check `hasHydrated` before accessing auth state in components
- Use `useEffect` for client-only operations

### API URL Normalization
Both `AuthClient` and `MCPClient` strip trailing slashes from `VITE_API_URL` to prevent double-slash issues in URLs.

### Vite Configuration
```javascript
plugins: [react()]           # React plugin with Fast Refresh
resolve.alias: { '@': './src' }  # Path alias
server.port: 3000            # Dev server port
build.outDir: 'dist'         # Build output directory
```

### Routing
- Client-side routing with React Router v6
- Protected routes use `<AuthGuard>` wrapper
- Admin routes use `<AdminGuard>` wrapper
- 404 fallback redirects to landing page

## AWS/Terraform Notes

### S3 Structure
```
s3://533267084389-lambda-artifacts/
└── agent-task-logger-frontend/
    ├── dev/
    │   └── frontend/
    │       ├── index.html
    │       └── assets/
    │           ├── index-[hash].js
    │           └── index-[hash].css
    └── prod/
        └── (same structure)
```

### CloudFront Routing Pattern
- All requests → S3 static files
- 404/403 errors → `/index.html` (SPA routing)
- `/assets/*` → Long cache (1 year, immutable)
- `/index.html` → No cache (must-revalidate)

### CloudFront Distribution
- Origin: S3 bucket with OAI (Origin Access Identity)
- Price class: PriceClass_100 (US, Canada, Europe)
- HTTPS only (redirect HTTP → HTTPS)
- Gzip compression enabled

## Comparison with Previous Architecture

### Before (Next.js + OpenNext)
- **890 npm packages**
- **3 Lambda functions** (server, image, revalidation)
- **DynamoDB table** for ISR cache
- **SQS FIFO queue** for revalidation
- **5+ minute** build times
- **383 lines** of Terraform
- **333 lines** of GitHub Actions
- **Complex** routing with multiple origins

### After (Vite + React Router)
- **380 npm packages** (removed 510 packages!)
- **0 Lambda functions**
- **No DynamoDB**
- **No SQS**
- **1.5 second** build times
- **131 lines** of Terraform
- **187 lines** of GitHub Actions
- **Simple** S3 + CloudFront static hosting

## Related Repositories
- **Backend**: agent-task-logger (FastAPI + MCP server)
- **Shared AWS Resources**: S3 buckets, DynamoDB tables (backend only)

## Region
All AWS resources: **eu-west-2** (London)
