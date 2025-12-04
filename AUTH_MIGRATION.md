# Studio 535 - Authentication Migration Guide

## Overview

This migration replaces the paid Manus OAuth system with **free** authentication using:

- **Lucia Auth** - Open source session management ($0/month)
- **Google OAuth** - Free for unlimited users
- **GitHub OAuth** - Free for unlimited users
- **Email/Password** - Built-in, no external service needed

### Cost Comparison

| Service | Monthly Cost |
|---------|--------------|
| Manus OAuth | $$ (paid) |
| Lucia + Google + GitHub | **$0** |
| Auth0 | $23+/month |
| Clerk | $25+/month |

## Migration Steps

### 1. Install New Dependencies

```bash
cd C:\Users\gregs\OneDrive\Desktop\Projects\Studio535
pnpm install lucia @lucia-auth/adapter-drizzle arctic
```

### 2. Update Database Schema

Run the migration SQL against your TiDB database:

```bash
# Option A: Use drizzle-kit
pnpm db:push

# Option B: Run the migration SQL directly
# Connect to TiDB and run: drizzle/0006_auth_migration.sql
```

### 3. Set Up Google OAuth (FREE)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### 4. Set Up GitHub OAuth (FREE)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `Studio 535`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 5. Update Environment Variables

Create/update your `.env` file:

```env
# Database (existing)
DATABASE_URL="mysql://..."

# Session Security (existing JWT_SECRET works)
JWT_SECRET="your-existing-secret-or-generate-new-32+-char-string"

# Google OAuth (NEW - FREE)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# GitHub OAuth (NEW - FREE)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/github/callback"

# App URL
VITE_APP_URL="http://localhost:3000"

# Owner email for notifications
OWNER_EMAIL="you@example.com"
```

### 6. Remove Old Manus Variables

You can remove these from your `.env`:
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`
- `OWNER_OPEN_ID`

### 7. Test the Migration

```bash
pnpm dev
```

1. Open `http://localhost:3000/login`
2. Test Google login
3. Test GitHub login
4. Test email/password signup/signin

### 8. Make Yourself Admin

After logging in for the first time, update your user role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Files Changed

### Server Files
- `server/_core/lucia.ts` - NEW: Lucia auth configuration
- `server/_core/auth-router.ts` - NEW: Auth tRPC procedures
- `server/_core/auth-routes.ts` - NEW: OAuth Express routes
- `server/_core/context.ts` - Updated for Lucia sessions
- `server/_core/env.ts` - Updated environment variables
- `server/_core/index.ts` - Updated route registration
- `server/db.ts` - Updated with auth database functions
- `server/routers.ts` - Updated to use new auth router

### Client Files
- `client/src/pages/Login.tsx` - NEW: Login page
- `client/src/_core/hooks/useAuth.ts` - Updated auth hook
- `client/src/App.tsx` - Added /login route
- `client/src/const.ts` - Simplified login URL

### Schema Files
- `drizzle/schema.ts` - Updated users table, removed openId
- `drizzle/auth-schema.ts` - NEW: Auth-related tables
- `drizzle/0006_auth_migration.sql` - Database migration

### Deprecated Files (can be deleted)
- `server/_core/oauth.ts` - Old Manus OAuth
- `server/_core/sdk.ts` - Old Manus SDK
- `server/_core/types/manusTypes.ts` - Old Manus types
- `client/src/components/ManusDialog.tsx` - Old Manus dialog
- `.manus/` directory - Old Manus cache

## Production Deployment

For production (Vercel, Render, etc.):

1. Update OAuth redirect URIs to use your production domain
2. Set environment variables in your hosting platform
3. Run database migrations
4. Deploy!

## Troubleshooting

### "Invalid session" errors
Clear your browser cookies and try logging in again.

### Google OAuth not working
- Verify redirect URI matches exactly (including trailing slash)
- Make sure you enabled the Google+ API

### GitHub OAuth not working
- Verify callback URL matches exactly
- Make sure your GitHub OAuth app is not expired

### Database connection issues
Verify your DATABASE_URL is correct and the TiDB instance is accessible.

## Support

If you encounter issues, check:
1. Console logs for error messages
2. Network tab for failed requests
3. Database for schema issues

The new auth system is simpler and more reliable than Manus OAuth!
