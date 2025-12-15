# Studio 535 - Quick Setup Guide

## ✅ Database Already Configured!

Your TiDB Cloud database is ready to use:
```
Host: gateway01.eu-central-1.prod.aws.tidbcloud.com
Database: test
```

## 🚀 Deploy to Vercel in 5 Steps

### Step 1: Initialize Database Schema

Before deploying, you need to create the database tables. Run these commands locally:

```bash
# Clone the repository
git clone https://github.com/gregsuptown/Studio-535.git
cd Studio535

# Install dependencies
npm install
# or
pnpm install

# Create .env file with your database
echo 'DATABASE_URL="mysql://H4QVmWV8yUYXjmz.root:hClcTcbkYgB3seLY@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test"' > .env

# Push database schema (creates all tables)
npm run db:push
# or
pnpm db:push
```

This will create all necessary tables:
- users
- projects
- intakes
- quotes
- designs
- status_updates
- production
- fulfillment
- attachments
- portfolio

---

### Step 2: Generate JWT Secret

Generate a secure random string for JWT_SECRET:

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this online: https://generate-secret.vercel.app/32
```

Copy the generated string - you'll need it in Step 4.

---

### Step 3: Set Up Manus OAuth

1. Go to your [Manus Dashboard](https://manus.im/dashboard)
2. Create a new OAuth Application
3. Set the callback URL to: `https://your-app-name.vercel.app/api/oauth/callback`
4. Copy these values:
   - Application ID (`VITE_APP_ID`)
   - Your OpenID (`OWNER_OPEN_ID`)
   - Your Name (`OWNER_NAME`)

---

### Step 4: Set Up S3 Storage

Choose one option:

#### Option A: AWS S3 (Most Popular)
1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3)
2. Create a new bucket (e.g., `studio535-uploads`)
3. Go to IAM and create access keys
4. Copy: Access Key ID, Secret Access Key, Region, Bucket Name

#### Option B: Cloudflare R2 (No Egress Fees)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 → Create Bucket
3. Create API Token
4. Use S3-compatible endpoint

#### Option C: DigitalOcean Spaces (Simple & Affordable)
1. Go to [DigitalOcean Spaces](https://cloud.digitalocean.com/spaces)
2. Create a new Space
3. Generate API Keys
4. Copy credentials

---

### Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import: `gregsuptown/Studio-535`
4. Configure Build Settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):

```bash
# Database (already configured)
DATABASE_URL=mysql://H4QVmWV8yUYXjmz.root:hClcTcbkYgB3seLY@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test

# JWT Secret (from Step 2)
JWT_SECRET=your-generated-secret-here

# Manus OAuth (from Step 3)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your-manus-app-id
OWNER_OPEN_ID=your-manus-openid
OWNER_NAME=Your Name

# S3 Storage (from Step 4)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=studio535-uploads

# Application
VITE_APP_TITLE=Studio 535
VITE_APP_LOGO=/logo.svg
```

6. Click **"Deploy"**

---

## 🎉 Post-Deployment

### Test Your Site

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test the quote request form
3. Log in to admin dashboard: `https://your-app.vercel.app/admin`
4. Submit a test project inquiry
5. Check if notifications work

### Update OAuth Callback URL

After deployment, update your Manus OAuth app callback URL to match your actual Vercel URL:
```
https://your-actual-app-name.vercel.app/api/oauth/callback
```

### Add Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your domain (e.g., `studio535.com`)
3. Update DNS records as instructed
4. Update Manus OAuth callback URL to use custom domain

---

## 📋 Checklist

- [ ] Database schema initialized (`pnpm db:push`)
- [ ] JWT_SECRET generated
- [ ] Manus OAuth app created
- [ ] S3 bucket created and configured
- [ ] All environment variables added to Vercel
- [ ] Site deployed successfully
- [ ] Test form submission works
- [ ] Admin login works
- [ ] File uploads work
- [ ] Notifications received
- [ ] Custom domain configured (optional)

---

## 🆘 Need Help?

### Database Connection Issues
- Verify the DATABASE_URL is exactly as provided
- TiDB Cloud requires SSL by default (already configured in the URL)
- Check if your IP is whitelisted in TiDB Cloud dashboard

### Build Failures
- Check Vercel build logs for specific errors
- Ensure Node.js version is 18+ in Vercel settings
- Verify all dependencies are in package.json

### Authentication Issues
- Confirm VITE_APP_ID matches your Manus OAuth app
- Verify callback URL is correct in Manus dashboard
- Check JWT_SECRET is at least 32 characters

### File Upload Issues
- Test S3 credentials with AWS CLI
- Verify bucket permissions (PutObject, GetObject)
- Check CORS configuration on bucket

---

## 🔧 Alternative: Deploy to Railway

Railway is simpler for full-stack apps and includes database hosting:

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select `gregsuptown/Studio-535`
4. Railway will auto-detect the Node.js app
5. Add the same environment variables
6. Railway provides a database option if you prefer

---

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md) - Comprehensive documentation
- [Environment Variables Template](./.env.example) - All variables explained
- [Vercel Documentation](https://vercel.com/docs)
- [TiDB Cloud Docs](https://docs.pingcap.com/tidbcloud/)
