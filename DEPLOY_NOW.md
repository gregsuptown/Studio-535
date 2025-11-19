# SIMPLE RENDER DEPLOYMENT - Follow These Exact Steps

## 🚨 IMPORTANT: Use the Feature Branch

The deployment fixes are on branch: `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`

**DO NOT deploy from `main` branch** - it doesn't have the critical bug fixes!

---

## Step 1: Go to Render Dashboard

Open: https://dashboard.render.com/

Sign up or log in with GitHub

---

## Step 2: Create New Web Service

1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if you haven't connected GitHub
4. Find and select repository: **`Studio-535`** (or `GregShugal/Studio-535`)
5. Click **"Connect"**

---

## Step 3: Configure Service - COPY THESE EXACTLY

**IMPORTANT: Copy these settings exactly as shown**

### Basic Settings:
- **Name**: `studio535`
- **Region**: `Oregon` (or your preferred region)
- **Branch**: `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp` ⚠️ **CRITICAL**
- **Root Directory**: Leave blank
- **Runtime**: `Node`

### Build & Deploy:
- **Build Command**:
  ```
  npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm build
  ```

- **Start Command**:
  ```
  node dist/index.js
  ```

### Instance:
- **Instance Type**: `Free` (or `Starter` for no cold starts)

### Advanced (Optional):
- **Health Check Path**: `/api/health`

---

## Step 4: Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"**

### Add These Variables (click "Add Environment Variable" for each):

**REQUIRED - App won't work without these:**

```bash
NODE_ENV=production
PORT=10000
VITE_FRONTEND_URL=https://studio535.onrender.com
```

**REQUIRED - But you need to get values from your services:**

```bash
# Database - Get from TiDB Cloud
DATABASE_URL=mysql://username:password@host:4000/database

# JWT - Click "Generate" button in Render for this one
JWT_SECRET=[Let Render generate this]

# Manus OAuth - Get from https://dev.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=[Your Manus App ID]
OWNER_OPEN_ID=[Your Manus Owner ID]

# Stripe - Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# S3 or R2 - For file uploads
S3_BUCKET_NAME=studio535-uploads
S3_REGION=us-west-2
S3_ACCESS_KEY_ID=[Your S3/R2 key]
S3_SECRET_ACCESS_KEY=[Your S3/R2 secret]

# Email - Get from https://resend.com
RESEND_API_KEY=re_...

# App title
VITE_APP_TITLE=Studio 535
```

**If you don't have these credentials yet**, you can deploy with just the first 3 (NODE_ENV, PORT, VITE_FRONTEND_URL) to test if the build works. The app will start but features won't work until you add the others.

---

## Step 5: Deploy

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait for build (takes 5-10 minutes first time)

---

## Step 6: Watch the Build Logs

You'll see real-time logs. Look for:

**Success indicators:**
```
✅ Installing pnpm...
✅ Installing dependencies...
✅ Building frontend...
✅ Building backend...
✅ Build successful
✅ Starting service...
✅ Server running on port 10000
```

**If you see errors**, copy them and I'll help you fix them.

---

## Step 7: Test Your Deployment

Once it says "Live", test these:

### 1. Health Check:
```bash
curl https://studio535.onrender.com/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 2. Open in Browser:
Visit: `https://studio535.onrender.com`

Should see: Studio 535 landing page with proper styling

---

## 🐛 Common Errors and Fixes

### Error: "pnpm: command not found"
**Fix**: Make sure build command starts with `npm install -g pnpm@10 &&`

### Error: "Cannot find module './dist/index.js'"
**Fix**: Build failed. Check build logs for TypeScript errors

### Error: "ECONNREFUSED" or database errors
**Fix**: Check `DATABASE_URL` is correct and TiDB Cloud is accessible

### Error: Health check fails
**Fix**: Make sure `PORT=10000` is set in environment variables

### Blank page or unstyled HTML
**Fix**: This should be fixed now with the latest code. If still happens:
- Check browser console for 404 errors
- Verify build completed successfully
- Check that branch is `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`

---

## 📝 Minimal Test Deployment

If you just want to test if the build works, use ONLY these env vars:

```bash
NODE_ENV=production
PORT=10000
VITE_FRONTEND_URL=https://studio535.onrender.com
DATABASE_URL=mysql://test:test@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test
JWT_SECRET=test-secret-minimum-32-characters-long-random-string
```

This will let the app build and start. Features won't work, but you can verify the deployment succeeds.

---

## ✅ Success Checklist

- [ ] Selected correct branch: `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`
- [ ] Build command includes pnpm installation
- [ ] Start command is `node dist/index.js`
- [ ] Set at least NODE_ENV, PORT, VITE_FRONTEND_URL
- [ ] Build completed without errors
- [ ] Service shows as "Live"
- [ ] Health check returns 200 OK
- [ ] Frontend loads in browser

---

## 🆘 Still Having Issues?

Tell me:
1. **What error message you're seeing** (copy from Render logs)
2. **At what step it fails** (build, start, or runtime)
3. **The URL of your Render service** (if it got created)

I'll help you troubleshoot!

---

**The most common mistake**: Using `main` branch instead of `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`

Make absolutely sure you're deploying from the feature branch!
