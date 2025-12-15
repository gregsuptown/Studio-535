/**
 * Studio 535 - Authentication Router
 * 
 * Handles Google OAuth, GitHub OAuth, and Email/Password authentication
 * Free alternative to Manus OAuth
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./trpc";
import { lucia, googleAuth, githubAuth, hashPassword, verifyPassword, generateId } from "./lucia";
import { generateCodeVerifier, generateState } from "arctic";
import {
  createUser,
  getUserByEmail,
  getUserById,
  createOAuthAccount,
  getOAuthAccount,
  createPassword,
  getPasswordByUserId,
  updateUserLastSignIn,
  getAllUsers,
  updateUserRole,
} from "../db";
import { ENV } from "./env";

export const authRouter = router({
  // ============= SESSION =============
  
  /** Get current authenticated user */
  me: publicProcedure.query(({ ctx }) => ctx.user),

  /** Get session info */
  getSession: publicProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.user,
      isAuthenticated: !!ctx.user,
    };
  }),

  /** Logout - invalidate session */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.sessionId) {
      await lucia.invalidateSession(ctx.sessionId);
    }
    
    // Clear session cookie
    const blankCookie = lucia.createBlankSessionCookie();
    ctx.res.setHeader("Set-Cookie", blankCookie.serialize());
    
    return { success: true };
  }),

  // ============= GOOGLE OAUTH =============
  
  /** Get Google OAuth URL */
  getGoogleAuthUrl: publicProcedure.query(async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
    const url = googleAuth.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email", 
      "profile"
    ]);
    
    return {
      url: url.toString(),
      state,
      codeVerifier,
    };
  }),

  /** Handle Google OAuth callback */
  googleCallback: publicProcedure
    .input(z.object({
      code: z.string(),
      codeVerifier: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for tokens
        const tokens = await googleAuth.validateAuthorizationCode(input.code, input.codeVerifier);
        
        // Get user info from Google
        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        });
        
        if (!response.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to get user info from Google" });
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
          // Existing OAuth account - get user
          user = await getUserById(oauthAccount.userId);
        } else {
          // Check if user exists with this email
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
            
            // Create OAuth account link
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
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
        }
        
        // Update last sign in
        await updateUserLastSignIn(user.id);

        // Create session (convert numeric user ID to string for Lucia)
        const session = await lucia.createSession(user.id.toString(), {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

        return { success: true, user };
      } catch (error) {
        console.error("[Google OAuth] Error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OAuth authentication failed" });
      }
    }),

  // ============= GITHUB OAUTH =============
  
  /** Get GitHub OAuth URL */
  getGitHubAuthUrl: publicProcedure.query(async () => {
    const state = generateState();
    const url = githubAuth.createAuthorizationURL(state, ["user:email"]);
    
    return {
      url: url.toString(),
      state,
    };
  }),

  /** Handle GitHub OAuth callback */
  githubCallback: publicProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for tokens
        const tokens = await githubAuth.validateAuthorizationCode(input.code);
        
        // Get user info from GitHub
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
            "User-Agent": "Studio535",
          },
        });
        
        if (!userResponse.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to get user info from GitHub" });
        }
        
        const githubUser = await userResponse.json() as {
          id: number;
          login: string;
          name?: string;
          avatar_url?: string;
          email?: string;
        };
        
        // GitHub doesn't always return email in user endpoint, need to fetch separately
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
          throw new TRPCError({ code: "BAD_REQUEST", message: "Could not get email from GitHub. Please make sure your email is public or verified." });
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
              emailVerified: 1, // GitHub emails are verified
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
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
        }
        
        await updateUserLastSignIn(user.id);

        // Create session (convert numeric user ID to string for Lucia)
        const session = await lucia.createSession(user.id.toString(), {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

        return { success: true, user };
      } catch (error) {
        console.error("[GitHub OAuth] Error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OAuth authentication failed" });
      }
    }),

  // ============= EMAIL/PASSWORD =============
  
  /** Sign up with email and password */
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(1, "Name is required"),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(input.password);
      
      // Create user
      const userId = await createUser({
        email: input.email,
        emailVerified: 0,
        name: input.name,
        role: "user",
      });
      
      // Store password hash
      await createPassword({
        userId,
        hashedPassword,
      });
      
      const user = await getUserById(userId);
      
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }

      // Create session (convert numeric user ID to string for Lucia)
      const session = await lucia.createSession(userId.toString(), {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

      return { success: true, user };
    }),

  /** Sign in with email and password */
  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      
      const passwordRecord = await getPasswordByUserId(user.id);
      
      if (!passwordRecord) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "This account uses social login. Please sign in with Google or GitHub." });
      }
      
      const validPassword = await verifyPassword(input.password, passwordRecord.hashedPassword);
      
      if (!validPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      
      await updateUserLastSignIn(user.id);

      // Create session (convert numeric user ID to string for Lucia)
      const session = await lucia.createSession(user.id.toString(), {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

      return { success: true, user };
    }),

  // ============= ADMIN =============
  
  /** Get all users (admin only) */
  getUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  /** Update user role (admin only) */
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      // Prevent changing own role
      if (ctx.user && ctx.user.id === input.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot change your own role" });
      }
      
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
});
