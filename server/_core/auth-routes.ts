/**
 * Studio 535 - OAuth Routes
 * 
 * Express routes for Google and GitHub OAuth callbacks
 * These handle the browser redirect flow for social login
 */

import type { Express, Request, Response } from "express";
import { generateCodeVerifier, generateState } from "arctic";
import { googleAuth, githubAuth, lucia } from "./lucia";
import { createUser, getUserByEmail, getUserById, createOAuthAccount, getOAuthAccount, updateUserLastSignIn } from "../db";
import { ENV } from "./env";

// Import cookie functions using require (cookie package doesn't have proper ESM type exports)
const cookieModule = require("cookie");
const parseCookieHeader = cookieModule.parse;
const serializeCookie = cookieModule.serialize;

export function registerAuthRoutes(app: Express) {
  
  // ============= GOOGLE OAUTH =============
  
  /**
   * GET /api/auth/google
   * Initiates Google OAuth flow - redirects to Google's login page
   */
  app.get("/api/auth/google", async (_req: Request, res: Response) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
    const url = googleAuth.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile"
    ]);
    
    // Store state and codeVerifier in cookies for verification
    res.setHeader("Set-Cookie", [
      serializeCookie("google_oauth_state", state, {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      }),
      serializeCookie("google_oauth_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      }),
    ]);
    
    res.redirect(url.toString());
  });

  /**
   * GET /api/auth/google/callback
   * Handles Google OAuth callback - exchanges code for tokens
   */
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    const cookies = parseCookieHeader(req.headers.cookie || "");
    const storedState = cookies.google_oauth_state;
    const codeVerifier = cookies.google_oauth_code_verifier;
    
    // Clear OAuth cookies
    res.setHeader("Set-Cookie", [
      serializeCookie("google_oauth_state", "", { maxAge: 0, path: "/" }),
      serializeCookie("google_oauth_code_verifier", "", { maxAge: 0, path: "/" }),
    ]);
    
    // Verify state
    if (!code || !state || state !== storedState || !codeVerifier) {
      return res.redirect("/login?error=invalid_state");
    }
    
    try {
      // Exchange code for tokens
      const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);
      
      // Get user info from Google
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      
      if (!response.ok) {
        return res.redirect("/login?error=google_api_error");
      }
      
      const googleUser = await response.json() as {
        sub: string;
        email: string;
        email_verified: boolean;
        name?: string;
        picture?: string;
      };
      
      // Check if OAuth account exists
      let oauthAccount = await getOAuthAccount("google", googleUser.sub);
      let user;
      
      if (oauthAccount) {
        user = await getUserById(oauthAccount.userId);
      } else {
        user = await getUserByEmail(googleUser.email);
        
        if (user) {
          // Link Google to existing account
          await createOAuthAccount({
            userId: user.id,
            provider: "google",
            providerAccountId: googleUser.sub,
            accessToken: tokens.accessToken(),
          });
        } else {
          // Create new user
          const userId = await createUser({
            email: googleUser.email,
            emailVerified: googleUser.email_verified ? 1 : 0,
            name: googleUser.name || null,
            avatarUrl: googleUser.picture || null,
            role: "user",
          });
          
          await createOAuthAccount({
            userId,
            provider: "google",
            providerAccountId: googleUser.sub,
            accessToken: tokens.accessToken(),
          });
          
          user = await getUserById(userId);
        }
      }
      
      if (!user) {
        return res.redirect("/login?error=user_creation_failed");
      }
      
      await updateUserLastSignIn(user.id);

      // Create session (convert numeric user ID to string for Lucia)
      const session = await lucia.createSession(user.id.toString(), {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      res.setHeader("Set-Cookie", sessionCookie.serialize());
      res.redirect("/?login=success");
      
    } catch (error) {
      console.error("[Google OAuth] Callback error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // ============= GITHUB OAUTH =============
  
  /**
   * GET /api/auth/github
   * Initiates GitHub OAuth flow - redirects to GitHub's login page
   */
  app.get("/api/auth/github", async (_req: Request, res: Response) => {
    const state = generateState();
    
    const url = githubAuth.createAuthorizationURL(state, ["user:email"]);
    
    res.setHeader("Set-Cookie", serializeCookie("github_oauth_state", state, {
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    }));
    
    res.redirect(url.toString());
  });

  /**
   * GET /api/auth/github/callback
   * Handles GitHub OAuth callback - exchanges code for tokens
   */
  app.get("/api/auth/github/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    const cookies = parseCookieHeader(req.headers.cookie || "");
    const storedState = cookies.github_oauth_state;
    
    // Clear OAuth cookie
    res.setHeader("Set-Cookie", serializeCookie("github_oauth_state", "", { maxAge: 0, path: "/" }));
    
    // Verify state
    if (!code || !state || state !== storedState) {
      return res.redirect("/login?error=invalid_state");
    }
    
    try {
      // Exchange code for tokens
      const tokens = await githubAuth.validateAuthorizationCode(code);
      
      // Get user info from GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
          "User-Agent": "Studio535",
        },
      });
      
      if (!userResponse.ok) {
        return res.redirect("/login?error=github_api_error");
      }
      
      const githubUser = await userResponse.json() as {
        id: number;
        login: string;
        name?: string;
        avatar_url?: string;
        email?: string;
      };
      
      // GitHub doesn't always return email in user endpoint
      let email = githubUser.email;
      if (!email) {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
            "User-Agent": "Studio535",
          },
        });
        
        if (emailResponse.ok) {
          const emails = await emailResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
          const primaryEmail = emails.find(e => e.primary && e.verified);
          email = primaryEmail?.email || emails[0]?.email;
        }
      }
      
      if (!email) {
        return res.redirect("/login?error=no_email");
      }
      
      // Check if OAuth account exists
      let oauthAccount = await getOAuthAccount("github", githubUser.id.toString());
      let user;
      
      if (oauthAccount) {
        user = await getUserById(oauthAccount.userId);
      } else {
        user = await getUserByEmail(email);
        
        if (user) {
          await createOAuthAccount({
            userId: user.id,
            provider: "github",
            providerAccountId: githubUser.id.toString(),
            accessToken: tokens.accessToken(),
          });
        } else {
          const userId = await createUser({
            email,
            emailVerified: 1,
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url || null,
            role: "user",
          });
          
          await createOAuthAccount({
            userId,
            provider: "github",
            providerAccountId: githubUser.id.toString(),
            accessToken: tokens.accessToken(),
          });
          
          user = await getUserById(userId);
        }
      }
      
      if (!user) {
        return res.redirect("/login?error=user_creation_failed");
      }
      
      await updateUserLastSignIn(user.id);

      // Create session (convert numeric user ID to string for Lucia)
      const session = await lucia.createSession(user.id.toString(), {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      res.setHeader("Set-Cookie", sessionCookie.serialize());
      res.redirect("/?login=success");
      
    } catch (error) {
      console.error("[GitHub OAuth] Callback error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });
  
  console.log("[Auth] OAuth routes registered: /api/auth/google, /api/auth/github");
}
