# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Run Next.js dev server (http://localhost:3000)
npm run build        # Build for production
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

### OpenNext Build (AWS Lambda)
```bash
npx open-next@latest build    # Build with OpenNext for Lambda deployment
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
- **Next.js 14** with App Router (SSR/SSG)
- **OpenNext** for AWS Lambda deployment
- **shadcn/ui** + **Radix UI** for components
- **Tailwind CSS** for styling
- **Zustand** for client state management
- **TanStack Query** for server state
- **React Hook Form** + **Zod** for forms/validation

### AWS Infrastructure
The application deploys as a serverless Next.js app using:
- **3 Lambda Functions**: server (SSR), image optimization, revalidation
- **CloudFront**: CDN with custom routing to Lambda/S3
- **S3**: Static assets (`_next/static/*`)
- **DynamoDB**: ISR cache and tags
- **SQS**: Revalidation queue

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

**Important**: All API calls go through `NEXT_PUBLIC_API_URL` environment variable.

### Authentication Flow
- **Zustand store** (`src/stores/auth-store.ts`) manages auth state with localStorage persistence
- **SSR-aware**: Store uses no-op storage during SSR, only hydrates on client
- **Migration system**: Version-based localStorage migrations to handle schema changes
- Token stored in localStorage, sent as Bearer token in API requests
- Auth state includes: `token`, `user`, `isAuthenticated`, `isAdmin`

### State Management Patterns
- **Zustand**: Client-side state (auth, UI state)
  - Uses `persist` middleware for localStorage
  - SSR-compatible with `hasHydrated` flag
- **TanStack Query**: Server state (API data, caching, mutations)
  - Used for fetching/updating tasks
  - Handles loading/error states

## Key Architectural Patterns

### Component Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Main task dashboard
│   ├── settings/          # User settings
│   └── admin/             # Admin panel
├── components/
│   ├── ui/                # shadcn/ui primitives (Button, Dialog, etc.)
│   ├── auth/              # Auth-related components
│   ├── tasks/             # Task-specific components
│   │   ├── AITaskLogger.tsx    # AI-powered task logging UI
│   │   └── TaskTable.tsx       # Task list/table
│   ├── layout/            # Layout components
│   └── providers/         # React context providers
├── lib/
│   ├── api/               # API clients
│   │   ├── auth-client.ts      # Authentication API
│   │   ├── mcp-client.ts       # MCP protocol wrapper
│   │   └── ai-client.ts        # AI/LLM interactions
│   ├── auth/              # Auth utilities
│   └── utils.ts           # General utilities (cn, etc.)
├── stores/                # Zustand stores
│   └── auth-store.ts      # Global auth state
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Auth helper hook
│   └── use-toast.ts       # Toast notifications
└── types/                 # TypeScript type definitions
    └── index.ts           # Shared types (Task, API responses)
```

### Environment Variables
**Build-time** (must be prefixed with `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., Lambda Function URL)
- `NEXT_PUBLIC_AWS_REGION`: AWS region (eu-west-2)
- `NEXT_PUBLIC_ENVIRONMENT`: Environment (dev/prod)

**Runtime** (Lambda environment variables, set by Terraform):
- `CACHE_BUCKET_NAME`: S3 bucket for ISR cache
- `CACHE_DYNAMO_TABLE`: DynamoDB table for tags
- `REVALIDATION_QUEUE_URL`: SQS queue for revalidation

### Deployment Pipeline
GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. **Branch → Environment mapping**:
   - `main` → dev environment
   - `prod*` → prod environment
2. **Build**: `npx open-next@latest build` creates `.open-next/` directory
3. **Package**: Zip Lambda functions (server, image, revalidation)
4. **Upload**: S3 (Lambda zips + static assets) + SSM (secrets)
5. **Deploy**: Terraform applies infrastructure changes
6. **Outputs**: Frontend URL, Lambda names

### OpenNext Output Structure
```
.open-next/
├── server-functions/default/    # Main SSR Lambda
├── image-optimization-function/ # Image Lambda (optional)
├── revalidation-function/       # ISR revalidation Lambda (optional)
├── assets/                      # Static assets (_next/static)
└── cache/                       # Build cache
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
- Strict type checking enabled (`ignoreBuildErrors: false`)
- Shared types in `src/types/index.ts`
- API response types: `ApiResponse<T>` wrapper

## Important Implementation Notes

### SSR and Client State
- Zustand store is SSR-aware with `hasHydrated` flag
- Check `hasHydrated` before accessing auth state in components
- Use `useEffect` for client-only operations

### API URL Normalization
Both `AuthClient` and `MCPClient` strip trailing slashes from `NEXT_PUBLIC_API_URL` to prevent double-slash issues in URLs.

### Next.js Configuration
```javascript
output: 'standalone'           // Required for OpenNext/Lambda
images: { unoptimized: true }  // Images handled by Lambda
trailingSlash: false           // Consistent URL format
```

### Error Boundaries
`ErrorBoundary.tsx` component catches React errors. Use for wrapping route segments that may fail.

## AWS/Terraform Notes

### S3 Structure
```
s3://533267084389-lambda-artifacts/
└── agent-task-logger-frontend/
    ├── dev/
    │   ├── deployment-server.zip
    │   ├── deployment-image.zip
    │   ├── deployment-revalidation.zip
    │   └── frontend/
    │       ├── _assets/
    │       └── _cache/
    └── prod/
        └── (same structure)
```

### SSM Parameter Store
GitHub Actions uploads all repository secrets to:
```
/app/agent-task-logger-frontend/{environment}/{SECRET_NAME}
```
Sensitive secrets (with `API_KEY`, `TOKEN`, `SECRET`, `PASSWORD` in name) use `SecureString` type.

### CloudFront Routing Pattern
- `/_assets/*` → S3 static assets (immutable, max-age=31536000)
- `/_cache/*` → S3 cache (must-revalidate)
- `/_next/image/*` → Image optimization Lambda
- Everything else → Server Lambda (SSR)

### Lambda Function Names
- Server: `task-logger-frontend-server-{env}`
- Image: `task-logger-frontend-image-{env}`
- Revalidation: `task-logger-frontend-revalidation-{env}`

## Related Repositories
- **Backend**: agent-task-logger (FastAPI + MCP server)
- **Shared AWS Resources**: S3 buckets, SSM parameters, DynamoDB tables

## Region
All AWS resources: **eu-west-2** (London)
