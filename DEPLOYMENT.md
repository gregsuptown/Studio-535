# Studio 535 - Deployment Guide

## Required Environment Variables for Vercel/Production Deployment

### Database Configuration

```bash
# MySQL/TiDB Database Connection
DATABASE_URL="mysql://username:password@host:port/database_name"
# Example: "mysql://studio535_user:mypassword@db.example.com:3306/studio535_db"
# Or for PlanetScale: "mysql://username:password@aws.connect.psdb.cloud/studio535?ssl={"rejectUnauthorized":true}"
```

**Recommended Database Providers:**
- **PlanetScale** (MySQL-compatible, serverless, free tier available)
- **Railway** (PostgreSQL/MySQL, easy setup)
- **AWS RDS** (Production-grade MySQL)
- **DigitalOcean Managed Databases**

---

### Authentication (Manus OAuth)

```bash
# JWT Secret for session signing (generate a random 32+ character string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
# Example: "8f3a9b2c7d1e5f6a4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"

# Manus OAuth Configuration
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"

# Your Manus Application ID (get from Manus dashboard)
VITE_APP_ID="your-manus-app-id"
# Example: "app_2a3b4c5d6e7f8g9h"

# Owner Information (your Manus account)
OWNER_OPEN_ID="your-manus-openid"
OWNER_NAME="Your Name"
# Example OWNER_OPEN_ID: "openid_abc123xyz456"
```

**How to get Manus OAuth credentials:**
1. Log in to your Manus dashboard
2. Create a new OAuth application
3. Copy the Application ID, OAuth URLs, and your OpenID

---

### File Storage (S3-Compatible)

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="studio535-uploads"

# Example values:
# AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
# AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="studio535-production-files"
```

**Alternative S3-Compatible Storage Providers:**
- **AWS S3** (Most popular, pay-as-you-go)
- **Cloudflare R2** (S3-compatible, no egress fees)
- **DigitalOcean Spaces** (Simple, affordable)
- **Backblaze B2** (Low cost)

**Setup Instructions:**
1. Create an S3 bucket (or equivalent)
2. Set bucket permissions to allow your app to read/write
3. Generate access credentials (Access Key ID + Secret Key)
4. Configure CORS if needed for direct browser uploads

---

### Application Configuration

```bash
# Application Branding
VITE_APP_TITLE="Studio 535"
VITE_APP_LOGO="/logo.svg"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-analytics-site-id"
```

---

### Manus Built-in Services (Optional - for advanced features)

```bash
# Manus Forge API (for LLM, notifications, etc.)
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
```

---

## Complete .env.example Template

Copy this to `.env` and fill in your values:

```bash
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Authentication
JWT_SECRET="generate-a-long-random-string-here"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"
VITE_APP_ID="your-manus-app-id"
OWNER_OPEN_ID="your-openid"
OWNER_NAME="Your Name"

# File Storage (S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Application
VITE_APP_TITLE="Studio 535"
VITE_APP_LOGO="/logo.svg"

# Optional: Analytics
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""

# Optional: Manus Forge API
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
```

---

## Vercel Deployment Steps

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `gregsuptown/Studio-535`
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (or `npm install`)

5. Add all environment variables from the list above in the "Environment Variables" section

6. Click "Deploy"

### 3. Deploy via CLI

```bash
cd Studio535
vercel
# Follow the prompts
# Add environment variables when prompted or via Vercel dashboard
```

---

## Post-Deployment Setup

### 1. Run Database Migrations

After first deployment, you need to initialize the database:

```bash
# Connect to your deployed project
vercel env pull .env.local

# Run migrations
pnpm db:push
```

Or run migrations directly on your database using the SQL files in `drizzle/` folder.

### 2. Test the Application

- Visit your deployed URL
- Test the quote request form
- Log in to the admin dashboard at `/admin`
- Verify file uploads work
- Check email notifications

### 3. Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `studio535.com`)
4. Update DNS records as instructed by Vercel

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check if your database allows connections from Vercel's IP ranges
- For PlanetScale, ensure SSL is enabled in connection string

### File Upload Failures
- Verify S3 credentials are correct
- Check bucket permissions (needs PutObject, GetObject permissions)
- Ensure CORS is configured if uploading from browser

### Authentication Not Working
- Verify `JWT_SECRET` is set and at least 32 characters
- Check `VITE_APP_ID` matches your Manus OAuth app
- Ensure OAuth callback URLs are configured in Manus dashboard

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (use Node 18+)
- Review build logs in Vercel dashboard for specific errors

---

## Security Notes

⚠️ **Never commit `.env` files to Git!**

- Keep all secrets secure
- Rotate credentials periodically
- Use different credentials for development and production
- Enable 2FA on all service accounts (AWS, database, etc.)

---

## Alternative Deployment Platforms

This application can also be deployed to:

- **Railway** (Easiest for full-stack apps, includes database)
- **Render** (Good for Node.js apps)
- **Fly.io** (Global edge deployment)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk** (Enterprise-grade)

Each platform has similar environment variable configuration - just use the same variables listed above.
