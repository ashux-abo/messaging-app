# Deployment Guide

## Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- Clerk account (already set up)
- Convex account (already set up)
- GitHub account for version control

## Step 1: Prepare for Production

### 1.1 Environment Setup

Create a `.env.production` file (or use Vercel's environment variable settings):

```env
# Clerk - Use your production keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex - Use your production deployment
CONVEX_DEPLOYMENT=prod:...
NEXT_PUBLIC_CONVEX_URL=https://<production-deployment>.convex.cloud
```

### 1.2 Build Locally

Verify the build works locally before deploying:

```bash
npm run build
npm start
```

## Step 2: Deploy Convex Backend

### Option A: Automatic Deployment (Recommended)

1. **Link your Convex project to Git:**
   ```bash
   npx convex dev
   ```
   This will prompt you to link your git repo.

2. **Deploy to production:**
   ```bash
   npx convex deploy
   ```

3. **Get your production Convex URL:**
   The deployment command will output your production URL. Update Vercel environment variables.

### Option B: Manual Convex Deployment

1. Push all Convex changes to your main branch
2. Run: `npx convex deploy --prod`
3. Copy the production URL to your environment variables

## Step 3: Deploy to Vercel

### 3.1 Using Git (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy messaging app"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables:**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.production`:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
     - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
     - `CONVEX_DEPLOYMENT`
     - `NEXT_PUBLIC_CONVEX_URL`

4. **Deploy:**
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Future pushes to `main` auto-deploy

### 3.2 Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (interactive)
vercel

# For production
vercel --prod
```

## Step 4: Configure Clerk for Production

1. **Go to Clerk Dashboard:**
   - Project Settings → Domains

2. **Add your production domain:**
   - Example: `https://messaging-app-xyz.vercel.app`

3. **Update environment variables in Clerk:**
   - Ensure CORS is configured for your domain
   - Set webhook endpoints if needed

4. **Update Sign-in/Sign-up URLs:**
   - Go to Redirects
   - Update the post-sign-in and post-sign-out URLs to your production domain

## Step 5: Configure Convex for Production

1. **Go to Convex Dashboard:**
   - Select your production deployment

2. **Update CORS/Origins:**
   - Add your production domain
   - Example: `https://messaging-app-xyz.vercel.app`

3. **Set API keys** (if using any external integrations)

## Step 6: Test Production Deployment

After deployment:

1. **Visit your production URL:**
   ```
   https://messaging-app-xyz.vercel.app
   ```

2. **Test core features:**
   - Sign up with test account
   - Create a direct message
   - Send a message
   - Check typing indicators
   - Test dark/light mode toggle

3. **Check browser console** for any errors

4. **Test on mobile** for responsive design

## Monitoring & Maintenance

### Vercel Dashboard

- **Deployments**: Track all deployments and rollbacks
- **Analytics**: View page performance and metrics
- **Environment Variables**: Update secrets without redeploying
- **Logs**: Monitor server and edge function logs

### Convex Dashboard

- **Usage**: Monitor database operations and costs
- **Functions**: View function calls and performance
- **Logs**: Check for any backend errors
- **Deployments**: Manage schema versions

### Monitoring Tools

Set up monitoring for production:

```bash
# Add Sentry for error tracking (optional)
npm install @sentry/nextjs

# Add LogRocket for session replay (optional)
npm install logrocket
```

## Scaling & Performance

### Database Optimization

- Indexes are already configured in `convex/schema.ts`
- Monitor query performance in Convex dashboard
- Add more indexes if needed for slow queries

### Frontend Performance

- Next.js automatically optimizes images
- Code splitting is automatic
- Use `npm run build` to analyze bundle size:
  ```bash
  npm install --save-dev @next/bundle-analyzer
  ```

### Costs

#### Vercel (Hobby/Pro Plan)

- Hobby: Free tier available
- Pro: $20/month for hobby projects
- Enterprise: Contact sales for high-traffic apps

#### Convex (Pay-as-you-go)

- Free tier: 10GB storage, generous query limits
- Pay-as-you-go: $0.50 per million reads + storage

### Expected Costs (Estimate)

For a small messaging app (1000 active users):
- **Vercel**: $0-20/month
- **Convex**: $5-50/month
- **Clerk**: $0-25/month (depends on usage)
- **Total**: ~$30-100/month

## Troubleshooting

### Common Issues

#### 1. "Cannot find Convex URL"
- Check environment variables are set in Vercel
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Redeploy after changing env vars

#### 2. "Clerk authentication failing"
- Verify Clerk keys are correct
- Add production domain to Clerk dashboard
- Check CORS settings in both Clerk and Convex

#### 3. "Messages not syncing"
- Check Convex deployment is running
- Verify `CONVEX_DEPLOYMENT` matches your prod deployment
- Check browser console for errors

#### 4. "Slow message delivery"
- Check Convex usage in dashboard
- Monitor network tab in DevTools
- Consider adding CDN caching for static assets

## Rolling Back

### Rollback to Previous Version

```bash
# Via Vercel CLI
vercel rollback

# Or use Vercel Dashboard:
# 1. Go to Deployments
# 2. Click deployment to rollback to
# 3. Click "Promote to Production"
```

### Rollback Convex

```bash
npx convex deploy --no-sync
# This prevents overwriting schema
```

## Security Checklist

- [ ] Clerk keys are production keys (pk_live_ and sk_live_)
- [ ] Environment variables are set in Vercel (not in git)
- [ ] CORS origins are configured correctly
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Database backups are enabled (Convex auto-backup)
- [ ] Rate limiting is configured (optional)
- [ ] No sensitive data in error messages

## Continuous Deployment

### Auto-deployment Setup

**Vercel + GitHub:**
- Every push to `main` auto-deploys
- Pull requests get preview deployments
- Set branch protection rules in GitHub

**Convex:**
- Run `npx convex deploy` in your CI/CD pipeline
- Or use `vercel build` hook to trigger Convex deploy

### Example GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run linter
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy Convex
        env:
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}
        run: npx convex deploy --prod
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npm install -g vercel && vercel --prod --token $VERCEL_TOKEN
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Convex Docs**: https://convex.dev/docs
- **Next.js Docs**: https://nextjs.org/docs

## Conclusion

Your messaging app is now deployed and ready for users! 🚀

Monitor the dashboards regularly and optimize based on usage patterns.
