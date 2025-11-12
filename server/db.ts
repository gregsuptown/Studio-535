import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, intakeAttachments, InsertIntakeAttachment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Intake attachments helpers
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

import {
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
} from "../drizzle/schema";
import { desc } from "drizzle-orm";

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
