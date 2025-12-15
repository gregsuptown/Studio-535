/**
 * tRPC Context - Session Authentication
 * 
 * Uses Lucia Auth to validate sessions and provide user context
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { lucia } from "./lucia";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  sessionId: string | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let sessionId: string | null = null;

  try {
    // Parse session cookie
    const cookieHeader = opts.req.headers.cookie;
    if (cookieHeader) {
      const cookies = parseCookieHeader(cookieHeader);
      const sessionCookie = cookies["studio535_session"];
      
      if (sessionCookie) {
        // Validate session with Lucia
        const { session, user: sessionUser } = await lucia.validateSession(sessionCookie);

        if (session && sessionUser) {
          sessionId = session.id;
          // Get full user data from database (convert string ID back to number)
          const userId = parseInt(sessionUser.id, 10);
          const dbUser = await getUserById(userId);
          user = dbUser || null;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.error("[Auth] Session validation error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    sessionId,
  };
}
