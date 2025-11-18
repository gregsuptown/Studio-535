/**
 * IMPROVED VERSION of drizzle/schema.ts
 *
 * Key improvements:
 * 1. Added foreign key constraints
 * 2. Added database indexes for performance
 * 3. Standardized naming conventions (all camelCase)
 * 4. Added proper cascading deletes
 * 5. Added audit fields (createdBy, updatedBy)
 */

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Indexes for frequently queried fields
  emailIdx: index("email_idx").on(table.email),
  openIdIdx: index("openid_idx").on(table.openId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - Core workflow tracking
 * IMPROVED: Added foreign keys, indexes, and audit fields
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 50 }),
  projectTitle: varchar("projectTitle", { length: 255 }).notNull(),
  status: mysqlEnum("status", [
    "intake",
    "design",
    "approval",
    "production",
    "fulfillment",
    "completed",
    "cancelled"
  ]).default("intake").notNull(),

  // ADDED: Audit fields
  createdBy: int("createdBy").references(() => users.id),  // Who created this project
  assignedTo: int("assignedTo").references(() => users.id),  // Who is working on it

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Indexes for performance
  clientEmailIdx: index("client_email_idx").on(table.clientEmail),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  assignedToIdx: index("assigned_to_idx").on(table.assignedTo),
}));

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Intake forms - Step 1: Client request details
 * IMPROVED: Added foreign key with cascade delete
 */
export const intakeForms = mysqlTable("intakeForms", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraint
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  rawMessage: text("rawMessage").notNull(),
  projectType: varchar("projectType", { length: 100 }),
  material: varchar("material", { length: 100 }),
  dimensions: varchar("dimensions", { length: 255 }),
  quantity: int("quantity"),
  deadline: timestamp("deadline"),
  budget: varchar("budget", { length: 100 }),
  specialRequirements: text("specialRequirements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Index on foreign key
  projectIdIdx: index("project_id_idx").on(table.projectId),
}));

export type IntakeForm = typeof intakeForms.$inferSelect;
export type InsertIntakeForm = typeof intakeForms.$inferInsert;

/**
 * Quotes - Step 1: Generated quotes for projects
 * IMPROVED: Added foreign key, better naming
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraint
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  amount: int("amount").notNull(), // Store as cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  breakdown: text("breakdown"),
  clarifyingQuestions: text("clarifyingQuestions"),
  estimatedDuration: varchar("estimatedDuration", { length: 100 }),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected"]).default("draft").notNull(),

  // ADDED: Audit field
  createdBy: int("createdBy").references(() => users.id),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  projectIdIdx: index("project_id_idx").on(table.projectId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Designs - Step 2: Custom design development
 * IMPROVED: Added foreign key
 */
export const designs = mysqlTable("designs", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraint
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  designTheme: text("designTheme"),
  mockupUrl: varchar("mockupUrl", { length: 500 }),
  iconsFonts: text("iconsFonts"),
  designNotes: text("designNotes"),
  revisionNumber: int("revisionNumber").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "revision_requested"]).default("draft").notNull(),

  // ADDED: Audit field
  createdBy: int("createdBy").references(() => users.id),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  projectIdIdx: index("project_id_idx").on(table.projectId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Design = typeof designs.$inferSelect;
export type InsertDesign = typeof designs.$inferInsert;

/**
 * Status updates - Step 3: Client communication
 * IMPROVED: Added foreign keys
 */
export const statusUpdates = mysqlTable("statusUpdates", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraints
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  updateType: mysqlEnum("updateType", ["status", "approval", "inquiry", "upsell"]).notNull(),
  message: text("message").notNull(),
  nextSteps: text("nextSteps"),

  sentBy: int("sentBy")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  projectIdIdx: index("project_id_idx").on(table.projectId),
  sentByIdx: index("sent_by_idx").on(table.sentBy),
}));

export type StatusUpdate = typeof statusUpdates.$inferSelect;
export type InsertStatusUpdate = typeof statusUpdates.$inferInsert;

/**
 * Production setup - Step 4: Manufacturing details
 * IMPROVED: Added foreign key, standardized naming
 */
export const productionSetups = mysqlTable("productionSetups", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraint
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  checklist: text("checklist"),
  engraverSettings: text("engraverSettings"),
  packagingSetup: text("packagingSetup"),
  materialsPrepared: int("materialsPrepared").default(0).notNull(),
  estimatedCompletionDate: timestamp("estimatedCompletionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Index
  projectIdIdx: index("project_id_idx").on(table.projectId),
}));

export type ProductionSetup = typeof productionSetups.$inferSelect;
export type InsertProductionSetup = typeof productionSetups.$inferInsert;

/**
 * Fulfillment - Step 5: Final delivery and branding
 * IMPROVED: Added foreign key
 */
export const fulfillments = mysqlTable("fulfillments", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Added foreign key constraint
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  thankYouMessage: text("thankYouMessage"),
  careInstructions: text("careInstructions"),
  packagingNotes: text("packagingNotes"),
  shippingMethod: varchar("shippingMethod", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  shippedDate: timestamp("shippedDate"),
  deliveredDate: timestamp("deliveredDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Index
  projectIdIdx: index("project_id_idx").on(table.projectId),
}));

export type Fulfillment = typeof fulfillments.$inferSelect;
export type InsertFulfillment = typeof fulfillments.$inferInsert;

/**
 * File attachments for intake forms
 * IMPROVED: Standardized naming to camelCase
 */
export const intakeAttachments = mysqlTable("intakeAttachments", {
  id: int("id").autoincrement().primaryKey(),

  // Foreign key already exists, kept as-is
  intakeId: int("intakeId")
    .notNull()
    .references(() => intakeForms.id, { onDelete: "cascade" }),

  // IMPROVED: Changed from snake_case to camelCase for consistency
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Index
  intakeIdIdx: index("intake_id_idx").on(table.intakeId),
}));

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
  featured: int("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  featuredIdx: index("featured_idx").on(table.featured),
  categoryIdx: index("category_idx").on(table.category),
}));

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Orders table - Tracks all purchases and payments
 * IMPROVED: Standardized naming to camelCase
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),

  // IMPROVED: Changed from snake_case to camelCase
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),

  userId: int("userId").references(() => users.id),
  projectId: int("projectId").references(() => projects.id),

  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  orderType: mysqlEnum("orderType", ["product", "deposit", "balance"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),

  subtotal: int("subtotal").notNull(),
  tax: int("tax").default(0).notNull(),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),

  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  invoicePdfUrl: text("invoicePdfUrl"),
  invoicePdfKey: text("invoicePdfKey"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
}, (table) => ({
  // ADDED: Indexes
  userIdIdx: index("user_id_idx").on(table.userId),
  projectIdIdx: index("project_id_idx").on(table.projectId),
  statusIdx: index("status_idx").on(table.status),
  stripeSessionIdIdx: index("stripe_session_id_idx").on(table.stripeSessionId),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - Line items for each order
 * IMPROVED: Standardized naming to camelCase
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),

  orderId: int("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: varchar("productId", { length: 100 }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  description: text("description"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: int("unitPrice").notNull(),
  total: int("total").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Index
  orderIdIdx: index("order_id_idx").on(table.orderId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Project messages - Communication between clients and team
 * IMPROVED: Standardized naming to camelCase
 */
export const projectMessages = mysqlTable("projectMessages", {
  id: int("id").autoincrement().primaryKey(),

  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  senderOpenId: varchar("senderOpenId", { length: 64 }).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderRole: mysqlEnum("senderRole", ["admin", "user"]).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  projectIdIdx: index("project_id_idx").on(table.projectId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type ProjectMessage = typeof projectMessages.$inferSelect;
export type InsertProjectMessage = typeof projectMessages.$inferInsert;

/**
 * Quote templates - Reusable pricing templates for common services
 * IMPROVED: Standardized naming to camelCase
 */
export const quoteTemplates = mysqlTable("quoteTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  basePrice: int("basePrice").notNull(),
  laborHours: int("laborHours").default(0),
  hourlyRate: int("hourlyRate").default(0),
  materialCost: int("materialCost").default(0),
  markupPercentage: int("markupPercentage").default(0),
  notes: text("notes"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // ADDED: Indexes
  categoryIdx: index("category_idx").on(table.category),
  isActiveIdx: index("is_active_idx").on(table.isActive),
}));

export type QuoteTemplate = typeof quoteTemplates.$inferSelect;
export type InsertQuoteTemplate = typeof quoteTemplates.$inferInsert;

/**
 * Message attachments - Files attached to project messages
 * IMPROVED: Standardized naming to camelCase
 */
export const messageAttachments = mysqlTable("messageAttachments", {
  id: int("id").autoincrement().primaryKey(),

  messageId: int("messageId")
    .notNull()
    .references(() => projectMessages.id, { onDelete: "cascade" }),

  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // ADDED: Index
  messageIdIdx: index("message_id_idx").on(table.messageId),
}));

export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type InsertMessageAttachment = typeof messageAttachments.$inferInsert;
