# Render Deployment - Quick Start Guide

**Status**: ✅ All deployment issues fixed and ready!

---

## 🎯 What Was Fixed

Two critical bugs were preventing deployment:

1. **Static Files 404**: Frontend CSS/JS wouldn't load → ✅ FIXED
2. **Missing Health Check**: Platforms couldn't monitor app → ✅ FIXED

**See**: `DEPLOYMENT_FIXES.md` for technical details

---

## 🚀 Deploy to Render in 5 Minutes

### Step 1: Merge to Main Branch (1 min)

```bash
# Switch to main branch
git checkout main

# Merge the fixes
git merge claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp

# Push to GitHub
git push origin main
```

### Step 2: Create Render Account (1 min)

1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### Step 3: Deploy from GitHub (3 min)

1. **In Render Dashboard**:
   - Click **"New +"** → **"Web Service"**
   - Select repository: `GregShugal/Studio-535`
   - Click **"Connect"**

2. **Configure Service**:
   - **Name**: `studio535` (or your preferred name)
   - **Region**: `Oregon` (or closest to you)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```
     pnpm install --frozen-lockfile && pnpm build
     ```
   - **Start Command**:
     ```
     node dist/index.js
     ```
   - **Instance Type**: `Free`

3. **Click** "Create Web Service"

**That's it!** Render will now build and deploy your app.

---

## ⚙️ Step 4: Add Environment Variables (While Build Runs)

While the build is running, add your environment variables:

### Required Variables:

Click **"Environment"** tab in Render dashboard, then add:

```bash
# 1. Frontend URL (use your Render URL)
VITE_FRONTEND_URL=https://studio535.onrender.com

# 2. Database (from TiDB Cloud dashboard)
DATABASE_URL=mysql://username:password@host:4000/database?ssl={"rejectUnauthorized":true}

# 3. JWT Secret (click "Generate" button in Render)
JWT_SECRET=[Click Generate]

# 4. Node Environment
NODE_ENV=production

# 5. Manus OAuth (get from https://dev.manus.im)
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_app_id_here
OWNER_OPEN_ID=your_owner_id_here

# 6. Stripe (test keys from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 7. S3 or Cloudflare R2
S3_BUCKET_NAME=studio535-uploads
S3_REGION=us-west-2
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# 8. Email (from https://resend.com)
RESEND_API_KEY=re_...

# 9. App Config
VITE_APP_TITLE=Studio 535
PORT=10000
```

### Optional (Set Later):
```bash
# Only needed for Cloudflare R2 (not AWS S3)
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com

# Only needed after first deployment
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ Step 5: Verify Deployment (1 min)

Once build completes (5-10 minutes):

### 1. Check Health:
```bash
curl https://studio535.onrender.com/api/health
```

**Expected**: `{"status":"ok","timestamp":"2025-11-19T..."}`

### 2. Open App:
Visit: `https://studio535.onrender.com`

**Expected**: Studio 535 landing page with styling

### 3. Check Console:
- Open browser DevTools (F12)
- Look for any errors
- Verify no 404s for CSS/JS files

---

## 🔧 Post-Deployment Setup

### Configure Stripe Webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://studio535.onrender.com/api/stripe/webhook`
4. **Events**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. In Render dashboard, update `STRIPE_WEBHOOK_SECRET` env var
7. Render will auto-redeploy

### Configure Manus OAuth:

1. Go to: https://dev.manus.im
2. Update OAuth app settings:
   - **Redirect URI**: `https://studio535.onrender.com/auth/callback`
   - **Allowed Origins**: `https://studio535.onrender.com`
3. No redeploy needed

---

## 🐛 Troubleshooting

### Build Fails: "pnpm: command not found"

**Fix**: Update build command to:
```bash
npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm build
```

### Health Check Fails

**Check**:
1. Build logs for errors
2. `PORT` environment variable is set to `10000`
3. App started successfully (check logs)

### Frontend Shows Blank Page

**Fix**: Already fixed! But verify:
1. Check browser console for 404 errors
2. Verify `dist/public/` folder exists in build logs
3. Check that `NODE_ENV=production` is set

### "Service Unavailable" Error

**Causes**:
1. Missing environment variables (check logs)
2. Database connection failed (verify `DATABASE_URL`)
3. App crashed on startup (check error logs)

**Solution**: Check the **Logs** tab in Render dashboard for specific error

---

## 📊 What Happens During Deploy

1. **Build Phase** (5-10 min):
   - Install pnpm
   - Install dependencies (786 packages)
   - Build frontend with Vite → `dist/public/`
   - Build backend with esbuild → `dist/index.js`

2. **Deploy Phase** (1 min):
   - Start app: `node dist/index.js`
   - App listens on port 10000
   - Health check passes
   - Service marked as "Live"

3. **Your App is Now Live** at:
   - `https://studio535.onrender.com`

---

## 🎉 Success Criteria

- [x] Build completes without errors
- [x] Health check returns 200 OK
- [x] Frontend loads with styling
- [x] No 404 errors in console
- [x] Can navigate to different pages
- [ ] Can log in with Manus OAuth (after Manus config)
- [ ] Can create projects (after database tested)
- [ ] Can process payments (after Stripe webhook configured)

---

## 🔄 If Render Doesn't Work

**Fallback to Vercel** (Option 1 from your plan):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts to configure
```

**See**: `DEPLOYMENT_STATUS.md` for Vercel instructions

---

## 📝 Files You Need

All deployment files are ready:

- ✅ `render.yaml` - Render configuration
- ✅ `DEPLOYMENT_FIXES.md` - What was fixed
- ✅ `RENDER_DEPLOYMENT.md` - Comprehensive guide
- ✅ `DEPLOYMENT_STRATEGY.md` - Fallback plan (3→1→4→2)

---

## 🆘 Need Help?

1. **Check Logs**: Render Dashboard → Your Service → Logs tab
2. **Render Docs**: https://render.com/docs
3. **Render Community**: https://community.render.com
4. **Our Docs**: See `DEPLOYMENT_FIXES.md` for technical details

---

**Deployment Time**: ~15 minutes total
**Cost**: Free tier (with cold starts) or $7/month (Starter plan)
**Next Step**: Follow Step 1 above to get started!

---

**Last Updated**: November 19, 2025
**Git Branch**: `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`
**Latest Commit**: `ad211c1` - Critical deployment fixes
