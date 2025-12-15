import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Updated to use standard auth (replacing Manus OAuth)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Email address - unique identifier for the user */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Whether email has been verified */
  emailVerified: int("emailVerified").default(0).notNull(),
  name: text("name"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
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
 */
export const intakeAttachments = mysqlTable("intake_attachments", {
  id: int("id").autoincrement().primaryKey(),
  intakeId: int("intake_id").notNull().references(() => intakeForms.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size").notNull(),
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
  material: varchar("material", { length: 100 }),
  featured: int("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),

  // Before/after images for transformations
  beforeImageUrl: varchar("beforeImageUrl", { length: 500 }),
  afterImageUrl: varchar("afterImageUrl", { length: 500 }),

  // Detailed case study fields
  clientName: varchar("clientName", { length: 255 }),
  projectDuration: varchar("projectDuration", { length: 100 }),
  challenge: text("challenge"),
  solution: text("solution"),
  outcome: text("outcome"),

  // Client testimonial
  testimonialText: text("testimonialText"),
  testimonialAuthor: varchar("testimonialAuthor", { length: 255 }),
  testimonialRole: varchar("testimonialRole", { length: 255 }),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Orders table - Tracks all purchases and payments
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  userId: int("user_id").references(() => users.id),
  projectId: int("project_id").references(() => projects.id),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  orderType: mysqlEnum("order_type", ["product", "deposit", "balance"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(),
  tax: int("tax").default(0).notNull(),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  invoicePdfUrl: text("invoice_pdf_url"),
  invoicePdfKey: text("invoice_pdf_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - Line items for each order
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 100 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: int("unit_price").notNull(),
  total: int("total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Project messages - Communication between clients and team
 */
export const projectMessages = mysqlTable("project_messages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  senderId: int("sender_id").notNull(), // Changed from senderOpenId to use user ID
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  senderRole: mysqlEnum("sender_role", ["admin", "user"]).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectMessage = typeof projectMessages.$inferSelect;
export type InsertProjectMessage = typeof projectMessages.$inferInsert;

/**
 * Quote templates - Reusable pricing templates for common services
 */
export const quoteTemplates = mysqlTable("quote_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  basePrice: int("base_price").notNull(),
  laborHours: int("labor_hours").default(0),
  hourlyRate: int("hourly_rate").default(0),
  materialCost: int("material_cost").default(0),
  markupPercentage: int("markup_percentage").default(0),
  notes: text("notes"),
  isActive: int("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type QuoteTemplate = typeof quoteTemplates.$inferSelect;
export type InsertQuoteTemplate = typeof quoteTemplates.$inferInsert;

/**
 * Message attachments - Files attached to project messages
 */
export const messageAttachments = mysqlTable("message_attachments", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull().references(() => projectMessages.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: int("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type InsertMessageAttachment = typeof messageAttachments.$inferInsert;

// Export auth schema
export * from "./auth-schema";
