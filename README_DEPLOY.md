# 🚀 Deploy Studio 535 to Render

**Complete guide for deploying Studio 535 on Render.com**

---

## ✅ Prerequisites

Before deploying, ensure you have:
- GitHub repository: `GregShugal/Studio-535`
- Render account (free tier available)
- TiDB Cloud database (or any MySQL-compatible database)

**Optional but recommended:**
- Manus OAuth credentials (for user authentication)
- Stripe API keys (for payments)
- AWS S3 or Cloudflare R2 (for file uploads)
- Resend API key (for email notifications)

---

## 🎯 Quick Deploy (5 Minutes)

### **Step 1: Create Render Service**

1. **Go to Render**: https://dashboard.render.com/
2. **Sign up/Login** with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Connect Repository**: Select `Studio-535`
5. Click **"Connect"**

### **Step 2: Configure Service**

**Fill in these settings:**

| Setting | Value |
|---------|-------|
| **Name** | `studio535` |
| **Region** | `Oregon` (or closest to you) |
| **Branch** | `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp` ⚠️ |
| **Runtime** | `Node` |
| **Build Command** | `npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm build` |
| **Start Command** | `node dist/index.js` |
| **Instance Type** | `Free` (or `Starter` $7/mo for no cold starts) |

### **Step 3: Environment Variables**

Click **"Advanced"** → Add these environment variables:

#### **Minimal (to test deployment)**:
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=change-this-to-random-32-character-string-minimum
```

#### **Full Configuration** (for all features):
```bash
# Core Settings
NODE_ENV=production
PORT=10000
VITE_APP_TITLE=Studio 535
VITE_FRONTEND_URL=https://studio535.onrender.com

# Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars

# Database (TiDB Cloud)
DATABASE_URL=mysql://username:password@gateway.region.prod.aws.tidbcloud.com:4000/database?ssl={"rejectUnauthorized":true}

# Manus OAuth Authentication
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_manus_app_id
OWNER_OPEN_ID=your_owner_open_id

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_or_sk_live...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live...
STRIPE_WEBHOOK_SECRET=whsec_... (configure after deployment)

# File Storage (S3 or Cloudflare R2)
S3_BUCKET_NAME=studio535-uploads
S3_REGION=us-west-2
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_ENDPOINT=https://account.r2.cloudflarestorage.com (only for R2)

# Email Notifications
RESEND_API_KEY=re_...
```

### **Step 4: Deploy**

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Watch logs for success

---

## ✅ Verify Deployment

### **1. Health Check**
```bash
curl https://studio535.onrender.com/api/health
```
**Expected**: `{"status":"ok","timestamp":"2025-11-19T..."}`

### **2. Open App**
Visit: `https://studio535.onrender.com`

**Expected**: Landing page with full styling (no blank page!)

### **3. Browser Console**
- Open DevTools (F12)
- Check for errors
- Verify no 404s for CSS/JS files

---

## 🔧 Post-Deployment Configuration

### **A. Configure Stripe Webhook**

After deployment, set up Stripe webhook for payment notifications:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Add Endpoint**:
   - URL: `https://studio535.onrender.com/api/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
3. **Copy Signing Secret**: `whsec_...`
4. **Update Render**:
   - Go to service → Environment
   - Update `STRIPE_WEBHOOK_SECRET`
   - Render auto-redeploys (~2 min)

### **B. Configure Manus OAuth**

1. **Go to Manus Dashboard**: https://dev.manus.im
2. **Update OAuth App**:
   - Redirect URI: `https://studio535.onrender.com/auth/callback`
   - Allowed Origins: `https://studio535.onrender.com`
3. Copy `VITE_APP_ID` and `OWNER_OPEN_ID` to Render env vars

### **C. Set Up Database**

If first deployment with new database:

1. **In Render**, go to **Shell** tab
2. Run migrations:
   ```bash
   pnpm db:push
   ```

Or add to build command:
```bash
npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm build && pnpm db:push
```

---

## 🐛 Troubleshooting

### **Issue: Build Fails - "pnpm: command not found"**

**Fix**: Ensure build command starts with:
```bash
npm install -g pnpm@10 &&
```

### **Issue: App Crashes on Startup**

**Check Render Logs**. Common causes:

1. **Missing environment variables**
   - Ensure `JWT_SECRET` is set
   - Check `PORT=10000`

2. **Database connection failed**
   - Verify `DATABASE_URL` is correct
   - Check TiDB Cloud IP whitelist (Render uses dynamic IPs)

3. **Module errors**
   - Ensure branch is `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`
   - Latest commit has all fixes

### **Issue: "Cannot find module './dist/index.js'"**

**Cause**: Build failed but didn't error

**Fix**:
1. Check build logs for TypeScript errors
2. Run `pnpm build` locally to reproduce
3. Fix TypeScript errors in code

### **Issue: Frontend Shows Blank Page**

**This should be fixed!** But if it happens:

1. **Check browser console** for 404 errors
2. **Verify** `NODE_ENV=production` is set
3. **Check** build logs show: `✓ built in Xs`
4. **Ensure** branch has the static file path fix (commit `ad211c1`)

### **Issue: Health Check Fails**

**Causes**:
- Port not set correctly
- App crashed on startup
- Firewall blocking health checks

**Fix**:
1. Ensure `PORT=10000` in environment
2. Check app logs for startup errors
3. Verify `/api/health` endpoint exists

### **Issue: Cold Starts (Free Tier)**

**Symptom**: First request after 15 min takes 30+ seconds

**Cause**: Render free tier spins down inactive services

**Solutions**:
- **Upgrade to Starter Plan** ($7/mo) - no cold starts
- **Use cron job** to ping every 14 minutes:
  - Service: https://cron-job.org
  - URL: `https://studio535.onrender.com/api/health`

---

## 📊 What's Included

### **✅ Critical Fixes Applied**

All these bugs have been fixed in the deployment branch:

| Bug | Impact | Status |
|-----|--------|--------|
| Static file path error | Frontend 404s | ✅ Fixed |
| Missing health check | Platform can't monitor | ✅ Fixed |
| Stripe startup crash | App won't start | ✅ Fixed |
| OAuth initialization | Startup warnings | ✅ Fixed |

### **🔒 Security Fixes**

23 endpoints secured with proper authorization:
- Project access control
- Payment authorization
- Admin-only mutations
- Type-safe validation

See `DEPLOYMENT_FIXES.md` for technical details.

---

## 🎯 Success Checklist

After deployment, verify:

- [ ] Health check returns 200 OK
- [ ] Frontend loads with styling
- [ ] No 404 errors in browser console
- [ ] Can log in with Manus OAuth
- [ ] Can create intake form/project
- [ ] Can upload files (if S3 configured)
- [ ] Can process test payment (if Stripe configured)
- [ ] Admin can view all projects
- [ ] Users can only see their own projects

---

## 📁 Deployment Files

| File | Purpose |
|------|---------|
| `render.yaml` | Infrastructure as Code config |
| `DEPLOYMENT_FIXES.md` | Technical details of fixes |
| `README_DEPLOY.md` | This guide |

---

## 🔄 Updates and Redeployments

### **Automatic Deployments**

Render is configured to auto-deploy when you push to the branch.

### **Manual Deployment**

1. Go to Render dashboard → Your service
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**

### **Clear Cache and Redeploy**

If builds are failing mysteriously:

1. **Manual Deploy** → **"Clear build cache & deploy"**
2. Wait for fresh build

---

## 💰 Pricing

### **Free Tier**
- ✅ 750 hours/month free
- ✅ Automatic SSL
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity (cold starts)
- ⚠️ 512MB RAM

### **Starter Plan ($7/month)**
- ✅ No cold starts
- ✅ Always running
- ✅ 512MB RAM
- ✅ Better for production

---

## 🆘 Getting Help

### **If Deployment Fails:**

1. **Copy error from Render logs**
2. **Note which step failed**:
   - Build phase?
   - Start phase?
   - Runtime?
3. **Check this guide's troubleshooting section**
4. **Review**  `DEPLOYMENT_FIXES.md` for technical details

### **Resources:**
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

## 🚀 You're Ready!

**Everything is configured and ready to deploy.**

**Latest commit**: `be221a3` - All fixes applied
**Branch**: `claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp`
**Estimated time**: 10-15 minutes

**Start here**: https://dashboard.render.com/ → New Web Service

---

**Good luck! Your app will deploy successfully!** 🎉
