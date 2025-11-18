# Code Review: Issues and Improvements

## Executive Summary

This document outlines critical issues found in the Studio 535 codebase and provides concrete improvements. The codebase is generally well-structured, but has several security, performance, and maintainability issues that should be addressed.

---

## 🔴 Critical Issues

### 1. Authorization Bypass Vulnerability (HIGH SEVERITY)

**Location**: `server/routers.ts:69-71`

**Current Code**:
```typescript
getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
  return await getProjectById(input.id);
}),
```

**Issue**: Any authenticated user can access any project by simply knowing its ID. There's no verification that the user owns the project or is an admin.

**Impact**: Clients can view other clients' projects, including sensitive information like contact details, quotes, designs, and messages.

**Fix**: Add authorization check:
```typescript
getById: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input, ctx }) => {
    const project = await getProjectById(input.id);
    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    // Authorization: Only admins or the project owner can view
    const isOwner = project.clientEmail === ctx.user.email;
    const isAdmin = ctx.user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    return project;
  }),
```

**Same issue exists in**:
- `intake.getByProjectId` (line 181-185)
- `quotes.getByProjectId` (line 213-217)
- `designs.getByProjectId` (line 246-249)
- `production.getByProjectId` (line 321-325)
- `fulfillment.getByProjectId` (line 371-374)
- `messages.list` (line 441-445)

All of these need similar authorization checks!

---

### 2. Missing Authorization in Payment Flows

**Location**: `server/stripe-router.ts:184-260` and `262-341`

**Issue**: Users can create payment sessions for ANY project, not just their own:
```typescript
createDepositSession: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    totalAmount: z.number(),
  }))
  .mutation(async ({ input, ctx }) => {
    // No check if user owns this project!
    const depositAmount = Math.round(input.totalAmount * 0.1);
    // ...
  })
```

**Fix**: Verify project ownership before creating payment sessions.

---

## 🟡 Code Quality Issues

### 3. Duplicate Code

**Location**: `server/routers.ts:54-67`

**Issue**: `list` and `getMyProjects` are functionally identical for non-admin users.

```typescript
list: protectedProcedure.query(async ({ ctx }) => {
  const allProjects = await getAllProjects();
  if (ctx.user.role === "admin") {
    return allProjects;
  }
  return allProjects.filter(p => p.clientEmail === ctx.user.email);
}),

getMyProjects: protectedProcedure.query(async ({ ctx }) => {
  const allProjects = await getAllProjects();
  return allProjects.filter(p => p.clientEmail === ctx.user.email);
}),
```

**Fix**: Remove `list` or make them serve different purposes. Keep one as `getMyProjects` for users and use admin-specific queries for admins.

---

### 4. Type Safety Violations

**Locations**:
- `server/routers.ts:157`: `status: status as any`
- `server/routers.ts:194`: `status: status as any`
- `server/routers.ts:265`: `await updateDesign(id, data as any)`

**Issue**: Using `as any` defeats TypeScript's type checking and can lead to runtime errors.

**Fix**: Properly type the status enum and update functions:

```typescript
// In schema.ts, export the status type
export const projectStatusEnum = ["intake", "design", "approval", "production", "fulfillment", "completed", "cancelled"] as const;
export type ProjectStatus = typeof projectStatusEnum[number];

// In routers.ts
updateStatus: protectedProcedure
  .input(z.object({
    id: z.number(),
    status: z.enum(["intake", "design", "approval", "production", "fulfillment", "completed", "cancelled"])
  }))
  .mutation(async ({ input }) => {
    await updateProjectStatus(input.id, input.status); // Now properly typed
    return { success: true };
  }),
```

---

## ⚡ Performance Issues

### 5. Inefficient Client-Side Filtering

**Location**: `server/routers.ts:56-60`

**Issue**: Fetching ALL projects from database then filtering in application code:
```typescript
const allProjects = await getAllProjects();
if (ctx.user.role === "admin") {
  return allProjects;
}
return allProjects.filter(p => p.clientEmail === ctx.user.email);
```

**Impact**: As the database grows, this becomes increasingly slow. With 10,000 projects, every user query loads all 10,000 rows.

**Fix**: Filter at the database level:

```typescript
// In db.ts
export async function getProjectsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(projects)
    .where(eq(projects.clientEmail, email))
    .orderBy(desc(projects.createdAt));
}

// In routers.ts
list: protectedProcedure.query(async ({ ctx }) => {
  if (ctx.user.role === "admin") {
    return await getAllProjects();
  }
  return await getProjectsByEmail(ctx.user.email);
}),
```

---

### 6. No Pagination

**Issue**: All list queries return unlimited results. As data grows, this will cause performance issues and poor UX.

**Fix**: Add pagination support:

```typescript
list: protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }).optional())
  .query(async ({ ctx, input }) => {
    const { limit = 20, offset = 0 } = input || {};

    if (ctx.user.role === "admin") {
      return await getAllProjects(limit, offset);
    }
    return await getProjectsByEmail(ctx.user.email, limit, offset);
  }),
```

---

### 7. Inefficient Message Polling

**Location**: `client/src/pages/ProjectDetail.tsx:690-693`

**Issue**: Polling messages every 5 seconds creates unnecessary database queries:
```typescript
const { data: messages = [], isLoading } = trpc.messages.list.useQuery(
  { projectId },
  { enabled: !!user && projectId > 0, refetchInterval: 5000 }
);
```

**Impact**: With 100 active users, that's 1,200 queries per minute just for messages.

**Better Solution**: Use WebSockets or Server-Sent Events for real-time updates, or increase the interval to 30 seconds.

---

## 🗄️ Database Schema Issues

### 8. Missing Foreign Key Constraints

**Location**: `drizzle/schema.ts`

**Issue**: Most relationships are not enforced at the database level. For example:
```typescript
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(), // No FK to users!
  // ...
});

export const intakeForms = mysqlTable("intakeForms", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // No FK constraint!
  // ...
});
```

**Impact**: Data integrity issues - you can have orphaned records, invalid references, etc.

**Fix**: Add foreign key relationships:

```typescript
export const intakeForms = mysqlTable("intakeForms", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  // ...
});

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  // ...
});
```

---

### 9. Missing Database Indexes

**Issue**: No indexes defined on frequently queried columns.

**Impact**: Slow queries as data grows. Queries like "find all projects by email" will do full table scans.

**Fix**: Add indexes:

```typescript
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  status: mysqlEnum("status", [...]).default("intake").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // ...
}, (table) => ({
  clientEmailIdx: index("client_email_idx").on(table.clientEmail),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));
```

---

### 10. Inconsistent Naming Conventions

**Issue**: Mixed camelCase and snake_case in schema:
- `projects` table uses camelCase: `clientEmail`, `projectTitle`
- `intakeAttachments` table uses snake_case: `file_url`, `file_key`, `file_name`
- `orders` table uses snake_case: `order_number`, `customer_email`

**Impact**: Confusing for developers, harder to maintain.

**Fix**: Choose one convention (prefer camelCase for consistency with TypeScript) and standardize across all tables.

---

## 🏗️ Architecture Issues

### 11. Large Component Files

**Location**: `client/src/pages/ProjectDetail.tsx` (783 lines)

**Issue**: Component is too large and handles too many responsibilities:
- Project header rendering
- 7 different tab contents
- Payment form logic
- Message thread logic
- Multiple tRPC queries

**Fix**: Split into smaller components:

```
/pages/ProjectDetail/
  ├── index.tsx (main component, ~100 lines)
  ├── ProjectHeader.tsx
  ├── IntakeTab.tsx
  ├── QuoteTab.tsx
  ├── DesignTab.tsx
  ├── ProductionTab.tsx
  ├── FulfillmentTab.tsx
  ├── MessagesTab.tsx
  ├── PaymentsTab.tsx
  └── useProjectData.ts (custom hook for all queries)
```

---

### 12. Business Logic in Routes

**Issue**: Router file contains business logic (notification formatting, etc.) mixed with API route definitions.

**Example**: `server/routers.ts:147-176` has notification formatting logic inline.

**Fix**: Extract to service layer:

```typescript
// server/services/notification-service.ts
export function formatIntakeNotification(input: IntakeFormData, projectTitle: string) {
  const attachmentInfo = input.attachments?.length
    ? `\n\n📎 Attachments: ${input.attachments.length} file(s) uploaded`
    : "";

  return {
    title: `🎨 New Project Inquiry: ${projectTitle}`,
    content: [
      `**Client Information:**`,
      `Name: ${input.clientName}`,
      `Email: ${input.clientEmail}`,
      // ... rest of formatting
    ].filter(Boolean).join('\n'),
  };
}

// In routers.ts
await notifyOwner(formatIntakeNotification(input, input.projectTitle));
```

---

## 🛡️ Security Best Practices

### 13. Environment Variables in Production

**Location**: `.env.production:12, 20, 28`

**Issue**: Production environment file contains TODOs:
```
# TODO: Generate a random 32+ character string for JWT_SECRET
# TODO: Get these from your Manus dashboard
# TODO: Set up S3 bucket and add credentials
```

**Fix**: Never commit production secrets. Use a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.).

---

### 14. Hardcoded URLs

**Location**: `server/stripe-router.ts:161-162, 242-243, 323-324`

**Issue**: Fallback to localhost:
```typescript
success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/payment/success`
```

**Fix**: Require environment variable, don't default to localhost in production:

```typescript
const frontendUrl = process.env.VITE_FRONTEND_URL;
if (!frontendUrl) {
  throw new Error("VITE_FRONTEND_URL environment variable is required");
}
```

---

## 📊 Suggested Priorities

### Immediate (Fix ASAP)
1. ✅ Fix authorization bypass vulnerability (Issue #1)
2. ✅ Add authorization to payment endpoints (Issue #2)
3. ✅ Add project ownership verification to all endpoints (Issue #1 extended)

### High Priority (This Sprint)
4. ✅ Add database indexes (Issue #9)
5. ✅ Add foreign key constraints (Issue #8)
6. ✅ Fix type safety issues (Issue #4)
7. ✅ Add pagination (Issue #6)

### Medium Priority (Next Sprint)
8. ✅ Extract business logic to service layer (Issue #12)
9. ✅ Split large components (Issue #11)
10. ✅ Implement database-level filtering (Issue #5)
11. ✅ Standardize naming conventions (Issue #10)

### Low Priority (Technical Debt)
12. ✅ Replace polling with WebSockets (Issue #7)
13. ✅ Remove duplicate code (Issue #3)
14. ✅ Add rate limiting
15. ✅ Add request logging/monitoring

---

## 🎯 Conclusion

The codebase demonstrates good modern practices (TypeScript, tRPC, proper tooling), but has critical security vulnerabilities that need immediate attention. The main issues are:

1. **Security**: Missing authorization checks allow users to access others' data
2. **Performance**: Client-side filtering and polling will not scale
3. **Data Integrity**: Missing foreign keys and indexes
4. **Maintainability**: Large files and mixed concerns

With these fixes applied, the application will be more secure, performant, and maintainable.
