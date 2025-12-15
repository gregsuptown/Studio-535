# Studio 535 - AI-Friendly Project Documentation

> **For AI Assistants**: This document provides a complete overview of the project for streamlined collaboration with Gemini, Claude, ChatGPT, or other AI tools.

---

## 🎯 Project Overview

**Studio 535** is a full-stack custom art/design project management platform with:
- **Client Portal**: Customers request quotes, track projects, upload files
- **Admin Dashboard**: Manage projects, quotes, designs, production, fulfillment
- **Product Catalog**: ~6,000 curated products from JDS Industries
- **Payments**: Stripe integration for deposits and full payments
- **Authentication**: Google & GitHub OAuth (free, no Manus required)

**Tech Stack:**
- Frontend: React 19 + TypeScript + TailwindCSS + Vite
- Backend: Express.js + tRPC + Drizzle ORM
- Database: TiDB Cloud (MySQL-compatible, requires SSL)
- Auth: Lucia + Arctic (Google/GitHub OAuth)
- Payments: Stripe
- File Storage: S3-compatible (AWS S3 or Cloudflare R2)

---

## 📁 Project Structure

```
Studio535/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Route components (Home, Admin, Catalog, etc.)
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # tRPC client, utilities
│   └── index.html
├── server/                # Express backend
│   ├── _core/             # Core server setup (index.ts, vite.ts, auth)
│   ├── routers.ts         # Main tRPC router
│   ├── catalog-router.ts  # Catalog endpoints
│   ├── stripe-router.ts   # Payment endpoints
│   └── db.ts              # Database queries
├── drizzle/               # Database schema & migrations
│   ├── schema.ts          # All table definitions
│   └── *.sql              # Migration files
└── shared/                # Shared types
```

---

## 🗄️ Database Schema

**22 Tables Total:**

### Core Business
1. `projects` - Customer projects
2. `intakeForms` - Initial quote requests
3. `quotes` - Pricing quotes
4. `designs` - Design iterations
5. `productionSetups` - Manufacturing details
6. `fulfillments` - Shipping/delivery
7. `statusUpdates` - Client communication
8. `projectMessages` - Real-time messaging
9. `portfolioItems` - Portfolio showcase

### Catalog System (NEW)
10. `catalog_categories` - Main product groups (Awards, Trophies, etc.)
11. `catalog_subcategories` - Secondary groupings
12. `catalog_products` - ~6,000 products from JDS
13. `product_pricing_tiers` - Volume discounts

### Payments
14. `orders` - Payment transactions
15. `order_items` - Order line items

### Authentication
16. `users` - User accounts
17. `sessions` - Active sessions
18. `oauth_accounts` - OAuth providers
19. `passwords` - Password hashes (if using password auth)

### File Management
20. `intake_attachments` - Quote request files
21. `message_attachments` - Chat files
22. `quote_templates` - Reusable quote templates

---

## 🔐 Environment Variables

### Required for Development

```bash
# Database (TiDB Cloud - requires SSL)
DATABASE_URL="mysql://H4QVmWV8yUYXjmz.root:hClcTcbkYgB3seLY@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test"

# Authentication
JWT_SECRET="your-random-32-char-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Owner
OWNER_EMAIL="greg141421@gmail.com"

# Application
VITE_APP_TITLE="Studio 535"
VITE_APP_URL="http://localhost:3000"
```

### Required for Production

**Add these to Vercel/Render:**

```bash
# Frontend URL (CRITICAL - missing from .env files!)
VITE_FRONTEND_URL="https://your-app.vercel.app"

# File Storage (AWS S3 or Cloudflare R2)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="studio535-uploads"

# Stripe Payments
STRIPE_SECRET_KEY="sk_live_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🚀 Deployment Guide

### Local Development

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start development server (Windows)
powershell -Command "$env:NODE_ENV='development'; pnpm exec tsx watch server/_core/index.ts"

# Or use npm script (may fail on Windows due to NODE_ENV)
pnpm dev
```

**Server runs on**: http://localhost:3002 (or 3000 if available)

### Deploy to Vercel (Recommended)

**Step 1: Connect GitHub**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import `gregsuptown/Studio-535`

**Step 2: Configure Build**
- Framework: Vite
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

**Step 3: Add Environment Variables**
Copy all variables from `.env.production` to Vercel dashboard.

**Step 4: Update URLs**
After deployment, update:
- `VITE_FRONTEND_URL` → Your Vercel URL
- `GOOGLE_REDIRECT_URI` → `https://your-app.vercel.app/api/auth/google/callback`

**Step 5: Configure Stripe Webhook**
- URL: `https://your-app.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## 🔧 Common Tasks

### Add a New Database Table

1. Edit `drizzle/schema.ts`
2. Run `pnpm db:push` to generate migration
3. Migration created in `drizzle/000X_*.sql`
4. Restart server to load new schema

### Add a New API Endpoint

1. Edit `server/routers.ts` or create new router file
2. Add procedure with `publicProcedure` or `protectedProcedure`
3. Define input schema with Zod
4. Use `await getDb()` for database queries

### Add a New Page

1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Use `trpc` hooks to fetch data

---

## ⚠️ Known Issues

### Critical Security Issues (Fix Before Production!)

**Authorization Bypass**: Any authenticated user can access ANY project by ID.

**Affected Endpoints** (in `server/routers.ts`):
- `projects.getById` (line 95)
- `intake.getByProjectId` (line 181)
- `quotes.getByProjectId` (line 213)
- `designs.getByProjectId` (line 246)
- `statusUpdates.getByProjectId` (line 290)
- `production.getByProjectId` (line 321)
- `fulfillment.getByProjectId` (line 371)
- `messages.list` (line 441)

**Fix**: See `examples/improved-routers.ts` for proper authorization checks.

### Database Connection Issues

**Problem**: TiDB Cloud requires SSL connections.

**Solution**: The `server/db.ts` file now creates a connection pool with SSL:
```typescript
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
```

### Windows Development

**Problem**: `NODE_ENV=development` doesn't work in Windows CMD.

**Solution**: Use PowerShell:
```powershell
powershell -Command "$env:NODE_ENV='development'; pnpm exec tsx watch server/_core/index.ts"
```

---

## 📊 Recent Changes

### Latest Updates (Not Yet Committed)

1. **JDS Catalog Integration** - 4 new tables, 3 new pages
2. **SSL Database Fix** - Updated `server/db.ts` for TiDB Cloud
3. **OWNER_EMAIL** - Set to greg141421@gmail.com
4. **Package.json** - Added repository info

### Migration Status

- Latest migration: `0006_violet_human_torch.sql`
- Status: ✅ Applied to database
- Changes: Catalog tables + auth schema updates

---

## 🤖 AI Assistant Instructions

When helping with this project:

1. **Database Queries**: Always use `await getDb()` and Drizzle ORM syntax
2. **Type Safety**: This project uses TypeScript - avoid `any` types
3. **Authentication**: All protected routes need `ctx.user` from tRPC context
4. **File Uploads**: Require S3 credentials (not yet configured)
5. **Payments**: Require Stripe keys (not yet configured)

**Common Commands:**
- `pnpm dev` - Start development
- `pnpm build` - Build for production
- `pnpm check` - Type check
- `pnpm db:push` - Run migrations

**Files to Never Modify:**
- `.env` (local secrets)
- `pnpm-lock.yaml` (managed by pnpm)
- `dist/` (build output)

---

## 📞 Support Resources

**Documentation:**
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Deployment checklist
- [SECURITY_FIXES_SUMMARY.md](./SECURITY_FIXES_SUMMARY.md) - Security issues
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Payment configuration

**External Services:**
- Database: [TiDB Cloud](https://tidbcloud.com)
- Deployment: [Vercel](https://vercel.com)
- Payments: [Stripe](https://stripe.com)

---

## ✅ Pre-Production Checklist

- [ ] Fix authorization bypass vulnerabilities
- [ ] Add `VITE_FRONTEND_URL` to all env files
- [ ] Set up Cloudflare R2 or AWS S3
- [ ] Configure Stripe production keys
- [ ] Generate secure JWT_SECRET (32+ chars)
- [ ] Test OAuth flows in production
- [ ] Set up Stripe webhook endpoint
- [ ] Run database migrations in production
- [ ] Test file uploads end-to-end
- [ ] Test payment flows with test cards

---

**Last Updated**: 2025-12-15
**Repository**: https://github.com/gregsuptown/Studio-535
**Owner**: Greg (greg141421@gmail.com)
