/**
 * Studio 535 - Authentication Schema
 * 
 * Lucia Auth tables for user authentication with OAuth providers
 * Replaces Manus OAuth with Google, GitHub, and email/password options
 */

import { mysqlTable, varchar, text, int, timestamp, bigint } from "drizzle-orm/mysql-core";

/**
 * Sessions table - Active user sessions (Lucia Auth)
 * Note: userId is varchar to match Lucia's string ID requirement, but we convert to/from int
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 21 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

/**
 * OAuth Accounts - Links OAuth providers to users
 * Supports Google, GitHub, and other providers
 */
export const oauthAccounts = mysqlTable("oauth_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'github'
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OAuthAccount = typeof oauthAccounts.$inferSelect;

/**
 * Password Hashes (for email/password auth)
 * Separate table for security - not exposed in user queries
 */
export const passwords = mysqlTable("passwords", {
  userId: int("user_id").primaryKey(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Password = typeof passwords.$inferSelect;
