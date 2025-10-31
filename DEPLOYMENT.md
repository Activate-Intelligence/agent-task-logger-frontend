# Frontend Deployment Guide

## Overview

The Task Logger frontend is a Next.js 14 application with SSR (Server-Side Rendering) enabled. It requires a Node.js hosting environment.

## Deployment Options

### Option 1: AWS Amplify (Recommended for AWS Users)

**Why AWS Amplify:**
- **100% Native AWS Service** - Fully managed by Amazon, not third-party
- Seamless integration with your existing Lambda backend in eu-west-2
- Automatic Next.js SSR detection and configuration
- Built-in CI/CD from Git repositories
- Free SSL certificates and CloudFront CDN (600+ global points of presence)
- Free tier: 1,000 build minutes/month, 5 GB storage, 15 GB data transfer
- Native AWS monitoring via CloudWatch

**Amplify supports Next.js 12-15 with full SSR capability.**

---

#### Deployment Method A: AWS Console (Fastest - 15 minutes)

**Step 1: Navigate to AWS Amplify Console**

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Select **eu-west-2 (London)** region (top right)
3. Search for "Amplify" in services
4. Click **"New app"** → **"Host web app"**

**Step 2: Connect Git Repository**

1. Choose your Git provider:
   - GitHub (recommended)
   - AWS CodeCommit
   - GitLab
   - Bitbucket

2. Authorize AWS Amplify to access your repository

3. Select repository: `agent-task-logger`

4. Select branch: `main`

**Step 3: Configure Build Settings**

1. **App name**: `task-logger-frontend`

2. **Monorepo detection**:
   - Amplify should auto-detect the `frontend` directory
   - If not, manually set **App root**: `frontend`

3. **Build settings**: Amplify will auto-detect `amplify.yml` in the frontend directory
   - The `amplify.yml` file is already configured for Next.js 14 SSR
   - Amplify automatically detects Next.js and enables SSR

4. **Service role**:
   - If first time: Click "Create new service role"
   - Name it: `AmplifyTaskLoggerRole`
   - Accept default permissions (Amplify needs CloudWatch logs access)

**Step 4: Set Environment Variables**

**CRITICAL**: Add these in **App settings** → **Environment variables** → **Manage variables**:

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your Lambda Function URL | `https://abc123.lambda-url.eu-west-2.on.aws` |
| `NEXT_PUBLIC_AWS_REGION` | `eu-west-2` | `eu-west-2` |

**Important Notes:**
- Environment variables are **build-time** for Next.js (variables prefixed with `NEXT_PUBLIC_`)
- After adding variables, you MUST redeploy for changes to take effect
- Do NOT commit these to Git

**Step 5: Deploy**

1. Click **"Save and deploy"**

2. Amplify will:
   - Provision resources (~2 minutes)
   - Install dependencies (`npm ci`)
   - Build Next.js app (`npm run build`)
   - Deploy to CloudFront CDN
   - **Total time: ~10-15 minutes for first deployment**

3. Monitor progress in the Amplify Console:
   - **Provision**: Creating build environment
   - **Build**: Running npm ci && npm run build
   - **Deploy**: Uploading to CloudFront
   - **Verify**: Health checks

4. Once complete, you'll see:
   - **Domain**: `https://main.abc123.amplifyapp.com`
   - Click the link to open your app

**Step 6: Test Your Deployment**

✅ **Post-Deployment Checklist:**

- [ ] Navigate to the Amplify domain
- [ ] Test login with credentials
- [ ] Refresh page after login (no white screen)
- [ ] Navigate to Settings page
- [ ] Navigate to Admin panel (if admin user)
- [ ] Test logout
- [ ] Open app in new tab while logged in (should auto-redirect to dashboard)
- [ ] Check browser console for errors (F12 → Console tab)
- [ ] Test on different browsers (Chrome, Firefox, Safari)

**Step 7: Configure Custom Domain (Optional)**

1. In Amplify Console → **Domain management**
2. Click **"Add domain"**
3. Enter your domain (e.g., `tasklogger.yourdomain.com`)
4. Amplify will:
   - Issue free SSL certificate via AWS Certificate Manager
   - Configure DNS (if using Route 53)
   - Set up CloudFront distribution

---

#### Deployment Method B: AWS CLI (For Automation)

**Prerequisites:**
```bash
# Install AWS CLI if not already installed
# macOS:
brew install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region: eu-west-2
```

**Deploy via CLI:**

```bash
# 1. Create Amplify app
aws amplify create-app \
  --name task-logger-frontend \
  --repository https://github.com/YOUR_USERNAME/agent-task-logger \
  --region eu-west-2

# 2. Connect branch
aws amplify create-branch \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --region eu-west-2

# 3. Set environment variables
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables \
    NEXT_PUBLIC_API_URL=https://YOUR_LAMBDA_URL.lambda-url.eu-west-2.on.aws \
    NEXT_PUBLIC_AWS_REGION=eu-west-2 \
  --region eu-west-2

# 4. Start deployment
aws amplify start-job \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --job-type RELEASE \
  --region eu-west-2
```

---

#### Continuous Deployment (Automatic)

Once connected to Git, Amplify automatically deploys on every push to `main`:

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Amplify automatically**:
   - Detects the push (webhook)
   - Runs build (using `amplify.yml`)
   - Deploys new version
   - Keeps previous version for instant rollback

**Branch-based deployments:**
- Each Git branch can have its own deployment
- `main` → Production (e.g., `https://main.abc123.amplifyapp.com`)
- `dev` → Staging (e.g., `https://dev.abc123.amplifyapp.com`)

---

#### Monitoring & Logs

**Access Logs:**

1. **Amplify Console**:
   - Go to your app → Select deployment
   - View build logs in real-time
   - Download logs for debugging

2. **CloudWatch Logs**:
   ```bash
   aws logs tail /aws/amplify/YOUR_APP_ID --follow
   ```

**Monitoring Metrics:**
- Amplify Console → **Monitoring** tab
- View: Requests, Data transfer, Errors, Latency
- Integrates with CloudWatch for alerts

---

#### Rollback Strategy

**Instant Rollback:**

1. Go to Amplify Console → **Deployments** tab
2. Find previous successful deployment
3. Click **"Redeploy this version"**
4. Rollback completes in ~2 minutes

**Git-based Rollback:**
```bash
# Revert commit locally
git revert HEAD
git push origin main

# Amplify auto-deploys the reverted version
```

---

#### Troubleshooting Amplify

**Issue: Build fails with "Module not found"**

**Solution**: Check `amplify.yml` has correct `appRoot: frontend`

**Issue: Environment variables not working**

**Solution**:
1. Verify variables are set in Amplify Console → Environment variables
2. Variable names MUST start with `NEXT_PUBLIC_` to be accessible in browser
3. After adding variables, trigger a new deployment (Redeploy)

**Issue: CORS errors when calling Lambda backend**

**Solution**: Update Lambda CORS to allow Amplify domain:

```typescript
// In terraform/main.tf or Lambda configuration
cors_configuration {
  allow_origins = [
    "https://main.YOUR_APP_ID.amplifyapp.com",
    "https://YOUR_CUSTOM_DOMAIN.com"  // if using custom domain
  ]
  allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allow_headers = ["Content-Type", "Authorization"]
  allow_credentials = true
}
```

**Issue: SSR not working / Getting 404 errors on refresh**

**Solution**: Amplify automatically configures Next.js SSR. If you see issues:
1. Verify `next.config.js` does NOT have `output: 'export'` (should be removed)
2. Check Amplify detected Next.js (build logs should show "Detected Next.js")
3. Ensure `amplify.yml` has `baseDirectory: .next`

**Issue: White screen after deployment**

**Solution**: This was the original problem! Already fixed by:
1. ✅ Removed `output: 'export'` from `next.config.js`
2. ✅ Enabled SSR
3. ✅ Fixed auth hydration issues

If you still see white screen:
- Open browser DevTools (F12) → Console tab
- Look for hydration errors
- Check Network tab for failed API calls

---

#### Cost Estimate (AWS Amplify)

**Free Tier (First 12 months):**
- 1,000 build minutes/month
- 5 GB hosted storage
- 15 GB served (data transfer out)

**After Free Tier:**
- Build time: $0.01 per build minute
- Hosting: First 5,000 visits/month free, then $0.01/visit
- Storage: $0.023 per GB/month
- Data transfer: $0.15 per GB

**Estimated Monthly Cost for Your App:**
- ~5-10 builds/month × 3 min/build = 30-50 build minutes = **$0.30-$0.50**
- Storage: ~100 MB = **$0.002**
- Data transfer: ~5 GB = **$0.75**
- **Total: ~$1-2/month** (very low traffic)

---

#### Amplify vs Vercel Comparison

| Feature | AWS Amplify | Vercel |
|---------|-------------|--------|
| **Provider** | 100% AWS Native | Third-party (not AWS) |
| **Integration** | Native with Lambda/DynamoDB | External |
| **Free Tier** | 1000 build min, 15GB transfer | 100GB bandwidth |
| **Cost** | Pay per use | $20/month Pro tier |
| **Region** | eu-west-2 supported | Global edge network |
| **Best For** | AWS users | Next.js-first users |

**For your use case (already on AWS)**: Amplify is the better choice.

---

### Option 2: Vercel

**Why Vercel:**
- Zero configuration for Next.js
- Automatic deployments from Git
- Free tier available
- Built by Next.js creators
- Edge network globally

**Note**: Vercel is NOT part of AWS ecosystem

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_API_URL`: Your Lambda Function URL
   - `NEXT_PUBLIC_AWS_REGION`: eu-west-2

4. **Production Deployment:**
   ```bash
   vercel --prod
   ```

**Connect to Git:**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Vercel will auto-deploy on every push to main

---

### Option 3: Docker + AWS ECS/Fargate

**Why Docker:**
- Full control over environment
- Can run anywhere
- Consistent across environments

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Build and Run:**
```bash
cd frontend
docker build -t task-logger-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-lambda-url.amazonaws.com \
  -e NEXT_PUBLIC_AWS_REGION=eu-west-2 \
  task-logger-frontend
```

---

### Option 4: Netlify

**Steps:**

1. **Connect Repository:**
   - Go to Netlify dashboard
   - "Add new site" → "Import from Git"
   - Select repository

2. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables:**
   - Add in Site settings → Environment variables
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_AWS_REGION`

---

## Environment Variables

Required for all deployment options:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-lambda-url.amazonaws.com` | Backend API endpoint |
| `NEXT_PUBLIC_AWS_REGION` | `eu-west-2` | AWS region |

---

## Post-Deployment Checklist

- [ ] Test login flow
- [ ] Test page refresh after login
- [ ] Test direct URL navigation to /dashboard
- [ ] Test logout flow
- [ ] Test admin panel access (if admin user)
- [ ] Verify no white screen on refresh
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

---

## Troubleshooting

### Issue: White screen after deployment

**Solution:** Ensure static export is disabled in `next.config.js`
```javascript
// ❌ WRONG - Causes white screen
output: 'export',

// ✅ CORRECT - Remove this line entirely
```

### Issue: 404 on page refresh

**Solution:** Configure your hosting platform for SPA routing:

**Vercel:** Automatic
**Netlify:** Add `_redirects` file:
```
/*    /index.html   200
```

**Amplify:** Add in build settings → Rewrites and redirects:
```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

### Issue: Environment variables not working

**Solution:** Restart deployment after adding environment variables. Next.js reads env vars at build time.

### Issue: API calls failing (CORS errors)

**Solution:** Check that your Lambda backend has CORS enabled:
```typescript
// Should be in terraform/main.tf
cors_configuration {
  allow_origins = ["*"]
  allow_methods = ["*"]
  allow_headers = ["*"]
}
```

---

## Monitoring

### Vercel
- Built-in analytics at vercel.com/dashboard
- Real-time logs
- Performance insights

### AWS Amplify
- CloudWatch logs
- Amplify Console metrics
- Build history

### Custom Monitoring
Add logging to track errors:

```typescript
// Add to frontend/src/app/layout.tsx
useEffect(() => {
  window.addEventListener('error', (e) => {
    console.error('Global error:', e);
    // Send to monitoring service
  });
}, []);
```

---

## Performance Optimization

1. **Enable Image Optimization** (Vercel/Amplify handle automatically)
2. **Add caching headers** (automatic with SSR)
3. **Monitor Core Web Vitals** in production
4. **Use React DevTools Profiler** to find slow components

---

## Rollback Strategy

### Vercel
- Go to Deployments tab
- Click "..." on previous deployment
- Click "Promote to Production"

### Amplify
- Go to App settings → Redirects
- Rollback to previous deployment

### Manual
- Revert Git commit
- Push to trigger new deployment

---

## Security Considerations

1. **HTTPS Only** - All hosting platforms provide free SSL
2. **Environment Variables** - Never commit secrets to Git
3. **CSP Headers** - Consider adding Content Security Policy
4. **CORS** - Backend should only allow your frontend domain in production

---

## Migration from S3 Static Hosting

If you were previously using S3 + CloudFront:

1. **Keep S3 bucket** for static assets (images, files)
2. **Deploy Next.js** to Vercel/Amplify
3. **Update DNS** to point to new hosting
4. **No backend changes needed** - Lambda Function URL works with any frontend

**Benefits of Migration:**
- ✅ No more white screen issues
- ✅ Server-side rendering
- ✅ Better SEO
- ✅ Faster initial page loads
- ✅ Can use API routes if needed

---

## Cost Comparison

| Platform | Free Tier | Pro Tier | Notes |
|----------|-----------|----------|-------|
| **Vercel** | 100GB bandwidth/month | $20/month | Best for Next.js |
| **Amplify** | 1000 build minutes/month | Pay per use | AWS integration |
| **Netlify** | 100GB bandwidth/month | $19/month | Good alternative |
| **S3+CloudFront** | Not supported anymore | - | Removed static export |

**Recommendation:** Start with Vercel free tier.

---

## Quick Start (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_AWS_REGION

# 4. Deploy to production
vercel --prod

# Done! Your app is live at https://your-app.vercel.app
```

---

## Support

For deployment issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- AWS Amplify: [docs.amplify.aws](https://docs.amplify.aws)
- Next.js: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
