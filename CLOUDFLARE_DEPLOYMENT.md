# Studio 535 - Cloudflare Pages Deployment Guide

## Overview

This guide will help you deploy Studio 535 to **Cloudflare Pages** with a full-stack setup including:
- ✅ Free hosting on Cloudflare's global CDN
- ✅ Automatic HTTPS and custom domains
- ✅ Serverless backend functions
- ✅ MySQL database (TiDB Cloud free tier)
- ✅ File storage (Cloudflare R2 or AWS S3)
- ✅ OAuth authentication (Google & GitHub)

---

## Prerequisites

Before you begin, make sure you have:

1. **Cloudflare Account** (free) - [Sign up here](https://dash.cloudflare.com/sign-up)
2. **GitHub Account** - Your code repository
3. **TiDB Cloud Account** (free) - For MySQL database
4. **Google Cloud Console** - For Google OAuth (free)
5. **GitHub Developer Settings** - For GitHub OAuth (free)

---

## Step 1: Set Up Database (TiDB Cloud - FREE)

### Why TiDB Cloud?
- ✅ **100% Free tier** with 5GB storage
- ✅ MySQL-compatible (works with existing schema)
- ✅ Serverless autoscaling
- ✅ Global availability

### Setup Instructions:

1. **Create TiDB Account**
   - Go to [TiDB Cloud](https://tidbcloud.com/)
   - Sign up for free account
   - Verify your email

2. **Create a Cluster**
   - Click "Create Cluster"
   - Select **"Serverless Tier"** (FREE)
   - Choose region closest to your users
   - Name it `studio535-db`
   - Click "Create"

3. **Get Connection String**
   - Once cluster is ready, click "Connect"
   - Copy the connection string:
     ```
     mysql://username:password@gateway.aws.tidbcloud.com:4000/studio535
     ```
   - Save this for later (you'll need it for `DATABASE_URL`)

4. **Run Database Migrations**
   - In your local terminal:
     ```bash
     cd Studio-535
     export DATABASE_URL="your-tidb-connection-string"
     pnpm db:push
     ```

---

## Step 2: Set Up OAuth Authentication (FREE)

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project: "Studio 535"

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Studio 535 Production"
   - Authorized redirect URIs:
     ```
     https://yourdomain.com/api/auth/google/callback
     https://studio535.pages.dev/api/auth/google/callback
     ```
   - Click "Create"
   - **Save the Client ID and Client Secret**

### GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit [github.com/settings/developers](https://github.com/settings/developers)
   - Click "OAuth Apps" > "New OAuth App"

2. **Create OAuth App**
   - Application name: "Studio 535"
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL:
     ```
     https://yourdomain.com/api/auth/github/callback
     ```
   - Click "Register application"
   - **Save the Client ID and generate a Client Secret**

---

## Step 3: Set Up File Storage

### Option A: Cloudflare R2 (Recommended - FREE)

**Why R2?**
- ✅ **No egress fees** (unlike S3)
- ✅ S3-compatible API
- ✅ 10GB free storage per month

**Setup:**
1. Go to Cloudflare Dashboard > R2
2. Create a bucket: `studio535-uploads`
3. Create API token with read/write permissions
4. Save the credentials:
   - `AWS_ACCESS_KEY_ID` = R2 Access Key ID
   - `AWS_SECRET_ACCESS_KEY` = R2 Secret Access Key
   - `AWS_REGION` = `auto`
   - `AWS_S3_BUCKET` = `studio535-uploads`

### Option B: AWS S3 (Pay-as-you-go)

1. Create S3 bucket: `studio535-uploads`
2. Create IAM user with S3 permissions
3. Generate access keys
4. Configure CORS for browser uploads

---

## Step 4: Deploy to Cloudflare Pages

### Method 1: Via Cloudflare Dashboard (Easiest)

1. **Connect GitHub Repository**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to "Pages"
   - Click "Create a project"
   - Connect to GitHub
   - Select repository: `gregsuptown/Studio-535`

2. **Configure Build Settings**
   - **Framework preset**: None
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `dist/public`
   - **Root directory**: `/`
   - **Node version**: `18` or higher

3. **Add Environment Variables**
   Click "Environment variables" and add:

   ```bash
   # Database
   DATABASE_URL=mysql://user:pass@gateway.aws.tidbcloud.com:4000/studio535
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_REDIRECT_URI=https://yourdomain.com/api/auth/github/callback
   
   # Owner
   OWNER_EMAIL=you@example.com
   
   # File Storage (R2 or S3)
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=auto
   AWS_S3_BUCKET=studio535-uploads
   
   # Stripe (Optional)
   STRIPE_SECRET_KEY=sk_live_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Application
   VITE_APP_TITLE=Studio 535
   VITE_APP_LOGO=/logo.svg
   VITE_APP_URL=https://yourdomain.com
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://studio535.pages.dev`

### Method 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
cd Studio-535
wrangler pages deploy dist/public --project-name=studio535

# Set environment variables
wrangler pages secret put DATABASE_URL
wrangler pages secret put JWT_SECRET
wrangler pages secret put GOOGLE_CLIENT_ID
wrangler pages secret put GOOGLE_CLIENT_SECRET
wrangler pages secret put GITHUB_CLIENT_ID
wrangler pages secret put GITHUB_CLIENT_SECRET
wrangler pages secret put AWS_ACCESS_KEY_ID
wrangler pages secret put AWS_SECRET_ACCESS_KEY
```

---

## Step 5: Configure Custom Domain

1. **Add Custom Domain**
   - In Cloudflare Pages project settings
   - Go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `studio535.com`)

2. **Update DNS**
   - If domain is on Cloudflare: Automatic
   - If external: Add CNAME record:
     ```
     CNAME @ studio535.pages.dev
     ```

3. **Update OAuth Redirect URIs**
   - Update Google OAuth redirect URI to use your custom domain
   - Update GitHub OAuth callback URL to use your custom domain

---

## Step 6: Test Your Deployment

1. **Visit Your Site**
   - Go to `https://yourdomain.com` or `https://studio535.pages.dev`

2. **Test Authentication**
   - Click "Sign in with Google"
   - Click "Sign in with GitHub"
   - Verify successful login

3. **Test File Upload**
   - Upload a test file
   - Verify it appears in R2/S3 bucket

4. **Test Quote Form**
   - Submit a test quote request
   - Check database for new entry

---

## Step 7: Set Up Stripe (Optional)

If you want to accept payments:

1. **Get Stripe Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Get your API keys (test and live)

2. **Configure Webhook**
   - In Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret

3. **Add to Cloudflare**
   - Add environment variables:
     ```
     STRIPE_SECRET_KEY=sk_live_...
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Make sure all dependencies are in `package.json`
- Run `pnpm install` locally first

**Error**: `TypeScript errors`
- **Solution**: Run `pnpm check` locally to fix type errors
- Consider using `skipLibCheck: true` in `tsconfig.json`

### Database Connection Issues

**Error**: `Connection refused`
- **Solution**: Check `DATABASE_URL` format
- Verify TiDB cluster is running
- Check firewall/IP whitelist settings

### OAuth Not Working

**Error**: `Redirect URI mismatch`
- **Solution**: Update OAuth redirect URIs to match your deployed URL
- Make sure to include both `pages.dev` and custom domain

### File Upload Fails

**Error**: `Access denied`
- **Solution**: Check R2/S3 bucket permissions
- Verify access keys are correct
- Configure CORS if uploading from browser

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | MySQL connection string | `mysql://user:pass@host:4000/db` |
| `JWT_SECRET` | ✅ | Session signing key (32+ chars) | `random-32-char-string` |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth secret | `GOCSPX-xxx` |
| `GOOGLE_REDIRECT_URI` | ✅ | Google callback URL | `https://domain.com/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth client ID | `Iv1.xxx` |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth secret | `xxx` |
| `GITHUB_REDIRECT_URI` | ✅ | GitHub callback URL | `https://domain.com/api/auth/github/callback` |
| `OWNER_EMAIL` | ✅ | Admin email for notifications | `admin@studio535.com` |
| `AWS_ACCESS_KEY_ID` | ✅ | R2/S3 access key | `xxx` |
| `AWS_SECRET_ACCESS_KEY` | ✅ | R2/S3 secret key | `xxx` |
| `AWS_REGION` | ✅ | Region (`auto` for R2) | `auto` or `us-east-1` |
| `AWS_S3_BUCKET` | ✅ | Bucket name | `studio535-uploads` |
| `STRIPE_SECRET_KEY` | ❌ | Stripe API key | `sk_live_xxx` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe public key | `pk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe webhook secret | `whsec_xxx` |
| `VITE_APP_TITLE` | ❌ | App title | `Studio 535` |
| `VITE_APP_LOGO` | ❌ | Logo path | `/logo.svg` |
| `VITE_APP_URL` | ✅ | Production URL | `https://studio535.com` |

---

## Cost Breakdown (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| **Cloudflare Pages** | Free | $0 |
| **TiDB Cloud** | Serverless (5GB) | $0 |
| **Cloudflare R2** | 10GB storage | $0 |
| **Google OAuth** | Unlimited | $0 |
| **GitHub OAuth** | Unlimited | $0 |
| **Custom Domain** | (if you own one) | ~$12/year |
| **Stripe** | Pay per transaction | 2.9% + $0.30 |
| **TOTAL** | | **$0/month** 🎉 |

---

## Next Steps

1. ✅ Monitor your deployment in Cloudflare Dashboard
2. ✅ Set up analytics (optional)
3. ✅ Configure email notifications
4. ✅ Add more OAuth providers if needed
5. ✅ Set up CI/CD for automatic deployments
6. ✅ Enable Cloudflare Web Analytics (free)

---

## Support

If you encounter issues:

1. Check Cloudflare Pages build logs
2. Review TiDB Cloud connection status
3. Verify all environment variables are set
4. Test OAuth redirect URIs
5. Check browser console for errors

---

## Security Checklist

- ✅ Use strong `JWT_SECRET` (32+ random characters)
- ✅ Enable HTTPS only (automatic with Cloudflare)
- ✅ Rotate OAuth secrets periodically
- ✅ Use production Stripe keys (not test keys)
- ✅ Configure CORS properly for file uploads
- ✅ Set up rate limiting (Cloudflare WAF)
- ✅ Enable 2FA on all service accounts

---

**Congratulations! Your Studio 535 is now live on Cloudflare Pages! 🚀**
