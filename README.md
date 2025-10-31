# Agent Task Logger Frontend

Next.js frontend for the Agent Task Logger application, deployed to AWS Lambda using OpenNext.

## Architecture

This frontend is deployed as a serverless Next.js application using:

- **Next.js 14** with App Router
- **OpenNext** for AWS Lambda deployment
- **CloudFront** for CDN and routing
- **S3** for static asset hosting
- **Lambda Functions** for SSR, image optimization, and revalidation
- **DynamoDB** for ISR cache
- **SQS** for revalidation queue

## Infrastructure

The infrastructure is managed by Terraform and includes:

- **3 Lambda Functions**:
  - `task-logger-frontend-server-{env}` - Main Next.js SSR
  - `task-logger-frontend-image-{env}` - Image optimization
  - `task-logger-frontend-revalidation-{env}` - ISR revalidation

- **CloudFront Distribution** - Routes requests to appropriate Lambda or S3
- **S3 Bucket** - Static assets (_next/static/*)
- **DynamoDB Table** - ISR cache and tags
- **SQS Queue** - Revalidation events

## Deployment

Deployment is automated via GitHub Actions:

```bash
# Push to main branch → deploys to dev
git push origin main

# Push to prod* branch → deploys to prod
git push origin prod
```

### Manual Deployment

```bash
# Build with OpenNext
npm ci
npx open-next@latest build

# Deploy with Terraform
cd terraform
terraform init \
  -backend-config="region=eu-west-2" \
  -backend-config="bucket=533267084389-tf-state" \
  -backend-config="key=aws/dev/agents/agent-task-logger-frontend"

terraform apply \
  -var="s3_bucket=533267084389-lambda-artifacts" \
  -var="s3_prefix=agent-task-logger-frontend/dev/" \
  -var="environment=dev"
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Environment Variables

### Build-time (GitHub Actions)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_AWS_REGION` - AWS region (eu-west-2)
- `NEXT_PUBLIC_ENVIRONMENT` - Environment (dev/prod)

### Runtime (Lambda)
- `CACHE_BUCKET_NAME` - S3 bucket for ISR cache
- `CACHE_DYNAMO_TABLE` - DynamoDB table for tags
- `REVALIDATION_QUEUE_URL` - SQS queue for revalidation

## Repository Structure

```
agent-task-logger-frontend/
├── src/                    # Next.js application source
│   ├── app/               # App Router pages
│   ├── components/        # UI components (shadcn/ui)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API client
│   ├── stores/            # Zustand state stores
│   └── types/             # TypeScript definitions
├── terraform/             # Infrastructure as Code
│   ├── backend.tf         # Terraform backend config
│   ├── main.tf            # Lambda functions + S3
│   ├── cloudfront.tf      # CloudFront distribution
│   ├── variables.tf       # Input variables
│   └── outputs.tf         # Terraform outputs
├── .github/workflows/     # CI/CD pipelines
│   └── deploy.yml         # Deployment workflow
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Links

- **Backend Repository**: [agent-task-logger](https://github.com/yourusername/agent-task-logger)
- **Infrastructure**: Shared S3 bucket and SSM parameters with backend
- **AWS Region**: eu-west-2 (London)

## License

MIT
