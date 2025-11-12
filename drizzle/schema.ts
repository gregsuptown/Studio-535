import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - Core workflow tracking
 * Tracks each client project through the 5-step process
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 50 }),
  projectTitle: varchar("projectTitle", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["intake", "design", "approval", "production", "fulfillment", "completed", "cancelled"]).default("intake").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Intake forms - Step 1: Client request details
 */
export const intakeForms = mysqlTable("intakeForms", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  rawMessage: text("rawMessage").notNull(),
  projectType: varchar("projectType", { length: 100 }),
  material: varchar("material", { length: 100 }),
  dimensions: varchar("dimensions", { length: 255 }),
  quantity: int("quantity"),
  deadline: timestamp("deadline"),
  budget: varchar("budget", { length: 100 }),
  specialRequirements: text("specialRequirements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IntakeForm = typeof intakeForms.$inferSelect;
export type InsertIntakeForm = typeof intakeForms.$inferInsert;

/**
 * Quotes - Step 1: Generated quotes for projects
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  amount: int("amount").notNull(), // Store as cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  breakdown: text("breakdown"), // JSON string of cost breakdown
  clarifyingQuestions: text("clarifyingQuestions"),
  estimatedDuration: varchar("estimatedDuration", { length: 100 }),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Designs - Step 2: Custom design development
 */
export const designs = mysqlTable("designs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  designTheme: text("designTheme"),
  mockupUrl: varchar("mockupUrl", { length: 500 }),
  iconsFonts: text("iconsFonts"),
  designNotes: text("designNotes"),
  revisionNumber: int("revisionNumber").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "revision_requested"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Design = typeof designs.$inferSelect;
export type InsertDesign = typeof designs.$inferInsert;

/**
 * Status updates - Step 3: Client communication
 */
export const statusUpdates = mysqlTable("statusUpdates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  updateType: mysqlEnum("updateType", ["status", "approval", "inquiry", "upsell"]).notNull(),
  message: text("message").notNull(),
  nextSteps: text("nextSteps"),
  sentBy: int("sentBy").notNull(), // user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StatusUpdate = typeof statusUpdates.$inferSelect;
export type InsertStatusUpdate = typeof statusUpdates.$inferInsert;

/**
 * Production setup - Step 4: Manufacturing details
 */
export const productionSetups = mysqlTable("productionSetups", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  checklist: text("checklist"), // JSON array of checklist items
  engraverSettings: text("engraverSettings"),
  packagingSetup: text("packagingSetup"),
  materialsPrepared: int("materialsPrepared").default(0).notNull(), // boolean as tinyint
  estimatedCompletionDate: timestamp("estimatedCompletionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductionSetup = typeof productionSetups.$inferSelect;
export type InsertProductionSetup = typeof productionSetups.$inferInsert;

/**
 * Fulfillment - Step 5: Final delivery and branding
 */
export const fulfillments = mysqlTable("fulfillments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  thankYouMessage: text("thankYouMessage"),
  careInstructions: text("careInstructions"),
  packagingNotes: text("packagingNotes"),
  shippingMethod: varchar("shippingMethod", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  shippedDate: timestamp("shippedDate"),
  deliveredDate: timestamp("deliveredDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Fulfillment = typeof fulfillments.$inferSelect;
export type InsertFulfillment = typeof fulfillments.$inferInsert;

/**
 * File attachments for intake forms
 * Stores references to files uploaded by clients (design files, reference images, etc.)
 */
export const intakeAttachments = mysqlTable("intake_attachments", {
  id: int("id").autoincrement().primaryKey(),
  intakeId: int("intake_id").notNull().references(() => intakeForms.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IntakeAttachment = typeof intakeAttachments.$inferSelect;
export type InsertIntakeAttachment = typeof intakeAttachments.$inferInsert;

/**
 * Portfolio items - Showcase completed work
 */
export const portfolioItems = mysqlTable("portfolioItems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  featured: int("featured").default(0).notNull(), // boolean as tinyint
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;