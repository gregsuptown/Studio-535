# Studio 535

**Custom fabrication and engraving project management platform**

A full-stack application for managing custom woodworking, metalworking, and engraving projects with client intake, quotes, design approval, production tracking, and integrated payments.

---

## 🚀 Quick Start

### **For Deployment:**
👉 **See [README_DEPLOY.md](README_DEPLOY.md)** for complete Render deployment guide

### **For Development:**

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
pnpm dev

# Open http://localhost:3000
```

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Radix UI
- **Backend**: Node.js, Express, tRPC
- **Database**: MySQL (TiDB Cloud)
- **Auth**: Manus OAuth
- **Payments**: Stripe
- **Storage**: AWS S3 / Cloudflare R2
- **Email**: Resend

---

## 📁 Project Structure

```
Studio535/
├── client/          # React frontend
├── server/          # Express + tRPC backend
├── shared/          # Shared types and utilities
├── drizzle/         # Database schema
├── dist/            # Build output (generated)
└── render.yaml      # Render deployment config
```

---

## 🔧 Configuration

### **Environment Variables**

See `.env.example` for all required environment variables.

**Essential:**
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session encryption key
- `VITE_APP_ID` - Manus OAuth app ID
- `STRIPE_SECRET_KEY` - Stripe API key

**See**: `README_DEPLOY.md` for complete list

---

## 📚 Documentation

- **[README_DEPLOY.md](README_DEPLOY.md)** - Complete deployment guide for Render
- **[DEPLOYMENT_FIXES.md](DEPLOYMENT_FIXES.md)** - Technical details of deployment fixes
- **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Code review and security fixes
- **[SECURITY_FIXES_SUMMARY.md](SECURITY_FIXES_SUMMARY.md)** - Security implementation details

---

## ✅ Production Ready

This project includes:

✅ **Security fixes** - 23 endpoints secured with authorization
✅ **Type safety** - All TypeScript 'as any' removed
✅ **Deployment fixes** - Static files, health check, lazy initialization
✅ **CI/CD** - GitHub Actions workflow
✅ **Infrastructure as Code** - Complete Render configuration

---

## 🚀 Deploy Now

**Ready to deploy?**

```bash
# All fixes are on this branch:
git checkout claude/code-review-improvements-011foez2e7B7VVxWdxGnWLDp

# Follow the deployment guide:
```
👉 **[README_DEPLOY.md](README_DEPLOY.md)**

---

## 📝 License

MIT

---

**Built for custom fabrication shops to manage projects from intake to fulfillment.** 🛠️
