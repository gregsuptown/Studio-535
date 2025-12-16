import { eq, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  InsertUser,
  intakeAttachments,
  InsertIntakeAttachment,
  projectMessages,
  InsertProjectMessage,
  messageAttachments,
  InsertMessageAttachment,
  designs,
  fulfillments,
  intakeForms,
  InsertDesign,
  InsertFulfillment,
  InsertIntakeForm,
  InsertPortfolioItem,
  InsertProductionSetup,
  InsertProject,
  InsertQuote,
  InsertStatusUpdate,
  portfolioItems,
  productionSetups,
  projects,
  quotes,
  statusUpdates,
  sessions,
  oauthAccounts,
  passwords,
} from "../drizzle/schema";
import { and } from "drizzle-orm";

// Create connection pool with SSL for TiDB Cloud
console.log("Initializing database connection...");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
});

console.log("Database connection pool created");

// Export db for Lucia adapter
// We cast to any to avoid complex type mismatch issues between different drizzle/mysql2 versions
export const db = drizzle(poolConnection) as any;

// Helper to ensure DB is available (kept for backward compatibility, but now just returns db)
export async function getDb() {
  return db;
}

// ============= USER AUTHENTICATION =============

export async function createUser(data: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt' | 'lastSignedIn'>): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    ...data,
    lastSignedIn: new Date(),
  });
  
  return result[0].insertId;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============= OAUTH ACCOUNTS =============

export async function createOAuthAccount(data: {
  userId: number;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(oauthAccounts).values(data);
}

export async function getOAuthAccount(provider: string, providerAccountId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(oauthAccounts).where(
    and(
      eq(oauthAccounts.provider, provider),
      eq(oauthAccounts.providerAccountId, providerAccountId)
    )
  ).limit(1);
  
  return result[0];
}

// ============= PASSWORDS =============

export async function createPassword(data: { userId: number; hashedPassword: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(passwords).values(data);
}

export async function getPasswordByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(passwords).where(eq(passwords.userId, userId)).limit(1);
  return result[0];
}

// ============= INTAKE ATTACHMENTS =============

export async function createIntakeAttachment(attachment: InsertIntakeAttachment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create attachment: database not available");
    return undefined;
  }
  const result = await db.insert(intakeAttachments).values(attachment);
  return result;
}

export async function getIntakeAttachments(intakeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attachments: database not available");
    return [];
  }
  return await db.select().from(intakeAttachments).where(eq(intakeAttachments.intakeId, intakeId));
}

// ============= PROJECTS =============

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function updateProjectStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ status: status as any }).where(eq(projects.id, id));
}

// ============= INTAKE FORMS =============

export async function createIntakeForm(data: InsertIntakeForm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(intakeForms).values(data);
  return result[0].insertId;
}

export async function getIntakeFormByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(intakeForms).where(eq(intakeForms.projectId, projectId)).limit(1);
  return result[0];
}

// ============= QUOTES =============

export async function createQuote(data: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quotes).values(data);
  return result[0].insertId;
}

export async function getQuotesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.projectId, projectId)).orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result[0] || null;
}

export async function updateQuoteStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set({ status: status as any }).where(eq(quotes.id, id));
}

// ============= DESIGNS =============

export async function createDesign(data: InsertDesign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(designs).values(data);
  return result[0].insertId;
}

export async function getDesignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(designs).where(eq(designs.id, id)).limit(1);
  return result[0];
}

export async function getDesignsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(designs).where(eq(designs.projectId, projectId)).orderBy(desc(designs.createdAt));
}

export async function updateDesign(id: number, data: Partial<InsertDesign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(designs).set(data).where(eq(designs.id, id));
}

// ============= STATUS UPDATES =============

export async function createStatusUpdate(data: InsertStatusUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(statusUpdates).values(data);
  return result[0].insertId;
}

export async function getStatusUpdatesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(statusUpdates).where(eq(statusUpdates.projectId, projectId)).orderBy(desc(statusUpdates.createdAt));
}

// ============= PRODUCTION SETUPS =============

export async function createProductionSetup(data: InsertProductionSetup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productionSetups).values(data);
  return result[0].insertId;
}

export async function getProductionSetupByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productionSetups).where(eq(productionSetups.projectId, projectId)).limit(1);
  return result[0];
}

export async function updateProductionSetup(id: number, data: Partial<InsertProductionSetup>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productionSetups).set(data).where(eq(productionSetups.id, id));
}

// ============= FULFILLMENTS =============

export async function createFulfillment(data: InsertFulfillment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fulfillments).values(data);
  return result[0].insertId;
}

export async function getFulfillmentByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fulfillments).where(eq(fulfillments.projectId, projectId)).limit(1);
  return result[0];
}

export async function updateFulfillment(id: number, data: Partial<InsertFulfillment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fulfillments).set(data).where(eq(fulfillments.id, id));
}

// ============= PORTFOLIO =============

export async function createPortfolioItem(data: InsertPortfolioItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(portfolioItems).values(data);
  return result[0].insertId;
}

export async function getAllPortfolioItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems).orderBy(desc(portfolioItems.displayOrder), desc(portfolioItems.createdAt));
}

export async function getFeaturedPortfolioItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems).where(eq(portfolioItems.featured, 1)).orderBy(desc(portfolioItems.displayOrder));
}

// ============= PROJECT MESSAGES =============

export async function createProjectMessage(data: InsertProjectMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectMessages).values(data);
  return result[0].insertId;
}

export async function getProjectMessages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectMessages).where(eq(projectMessages.projectId, projectId)).orderBy(asc(projectMessages.createdAt));
}

export async function createMessageAttachment(data: InsertMessageAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messageAttachments).values(data);
  return result[0].insertId;
}

export async function getMessageAttachments(messageId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messageAttachments).where(eq(messageAttachments.messageId, messageId));
}
