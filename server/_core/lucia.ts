/**
 * Studio 535 - Lucia Auth Configuration
 * 
 * Free, open-source authentication using Lucia with Google & GitHub OAuth
 * Replaces paid Manus OAuth - $0/month for unlimited users
 */

import { Lucia } from "lucia";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google, GitHub } from "arctic";
import { db } from "../db";
import { users, sessions } from "../../drizzle/schema";
import { ENV } from "./env";

// Initialize Lucia adapter with Drizzle
// Note: We use numeric IDs in the database but convert to strings for Lucia
const adapter = new DrizzleMySQLAdapter(db, sessions, users as any);

// Create Lucia instance
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "studio535_session",
    expires: false, // Session cookies expire when browser closes, but we use persistent
    attributes: {
      secure: ENV.isProduction,
      sameSite: "lax",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      emailVerified: attributes.emailVerified === 1,
      name: attributes.name,
      avatarUrl: attributes.avatarUrl,
      role: attributes.role,
    };
  },
});

// OAuth Providers (Arctic library - lightweight, no dependencies)
export const googleAuth = new Google(
  ENV.googleClientId,
  ENV.googleClientSecret,
  ENV.googleRedirectUri
);

export const githubAuth = new GitHub(
  ENV.githubClientId,
  ENV.githubClientSecret,
  null // No redirect URI needed for GitHub in Arctic
);

// Password hashing using Web Crypto API (no external dependencies)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordData = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  // Combine salt and hash, encode as base64
  const combined = new Uint8Array(salt.length + new Uint8Array(hash).length);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);
  
  return Buffer.from(combined).toString("base64");
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const combined = Buffer.from(storedHash, "base64");
  
  const salt = combined.slice(0, 16);
  const storedHashBytes = combined.slice(16);
  
  const passwordData = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  const hashBytes = new Uint8Array(hash);
  
  if (hashBytes.length !== storedHashBytes.length) return false;
  
  let match = true;
  for (let i = 0; i < hashBytes.length; i++) {
    if (hashBytes[i] !== storedHashBytes[i]) match = false;
  }
  
  return match;
}

// Generate secure random ID
export function generateId(length: number = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

// Type declarations for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: number;
  email: string;
  emailVerified: number;
  name: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
}
