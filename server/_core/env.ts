export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Session security
  cookieSecret: process.env.JWT_SECRET ?? "",
  
  // Google OAuth (FREE)
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback",
  
  // GitHub OAuth (FREE)
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/api/auth/github/callback",
  
  // App configuration
  appUrl: process.env.VITE_APP_URL ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  
  // Owner email for admin notifications
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  
  // Optional: Forge API (for AI features)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
