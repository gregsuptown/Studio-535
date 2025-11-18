/**
 * IMPROVED VERSION of server/routers.ts
 *
 * Key improvements:
 * 1. Authorization checks on all project-related queries
 * 2. Removed duplicate code
 * 3. Fixed type safety issues
 * 4. Added helper function for authorization
 * 5. Extracted business logic to service layer
 * 6. Added pagination support
 */

import { COOKIE_NAME } from "@shared/const";
import { stripeRouter } from "./stripe-router";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createProject,
  createIntakeForm,
  createQuote,
  createDesign,
  createStatusUpdate,
  createProductionSetup,
  createFulfillment,
  createPortfolioItem,
  getAllProjects,
  getProjectById,
  getProjectsByEmail,  // NEW: Database-level filtering
  updateProjectStatus,
  getIntakeFormByProjectId,
  getQuotesByProjectId,
  updateQuoteStatus,
  getDesignsByProjectId,
  updateDesign,
  getStatusUpdatesByProjectId,
  getProductionSetupByProjectId,
  updateProductionSetup,
  getFulfillmentByProjectId,
  updateFulfillment,
  getAllPortfolioItems,
  getFeaturedPortfolioItems,
  createIntakeAttachment,
  getIntakeAttachments,
  createProjectMessage,
  getProjectMessages,
} from "./db";
import { formatIntakeNotification } from "./services/notification-service";  // NEW: Extracted service
import { notifyOwner } from "./_core/notification";

/**
 * Helper function to verify project access
 * Users can only access projects where they are the client, or if they're an admin
 */
async function verifyProjectAccess(projectId: number, user: any): Promise<void> {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
  }

  const isOwner = project.clientEmail === user.email;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to access this project"
    });
  }
}

// Project status enum for type safety
const projectStatusSchema = z.enum([
  "intake",
  "design",
  "approval",
  "production",
  "fulfillment",
  "completed",
  "cancelled"
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= PROJECTS =============
  projects: router({
    /**
     * List projects with pagination
     * Admins see all, users see only their own
     */
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const { limit = 20, offset = 0 } = input || {};

        // Admin sees all projects, users see only their own
        if (ctx.user.role === "admin") {
          return await getAllProjects(limit, offset);
        }

        return await getProjectsByEmail(ctx.user.email, limit, offset);
      }),

    /**
     * Get single project by ID
     * FIXED: Now includes authorization check
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify user has access to this project
        await verifyProjectAccess(input.id, ctx.user);
        return await getProjectById(input.id);
      }),

    /**
     * Update project status
     * FIXED: Now properly typed and includes authorization
     */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: projectStatusSchema,
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can update project status
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update project status"
          });
        }

        await updateProjectStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============= INTAKE & QUOTE (Step 1) =============
  intake: router({
    submit: publicProcedure
      .input(
        z.object({
          clientName: z.string().min(1),
          clientEmail: z.string().email(),
          clientPhone: z.string().optional(),
          projectTitle: z.string().min(1),
          rawMessage: z.string().min(10),
          projectType: z.string().optional(),
          material: z.string().optional(),
          dimensions: z.string().optional(),
          quantity: z.number().optional(),
          deadline: z.string().optional(),
          budget: z.string().optional(),
          specialRequirements: z.string().optional(),
          attachments: z.array(
            z.object({
              fileUrl: z.string(),
              fileKey: z.string(),
              fileName: z.string(),
              fileSize: z.number(),
              mimeType: z.string().optional(),
            })
          ).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Create project
        const projectId = await createProject({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          projectTitle: input.projectTitle,
          status: "intake",
        });

        // Create intake form
        const intakeId = await createIntakeForm({
          projectId,
          rawMessage: input.rawMessage,
          projectType: input.projectType,
          material: input.material,
          dimensions: input.dimensions,
          quantity: input.quantity,
          deadline: input.deadline ? new Date(input.deadline) : undefined,
          budget: input.budget,
          specialRequirements: input.specialRequirements,
        });

        // Save file attachments if provided
        if (input.attachments && input.attachments.length > 0) {
          for (const attachment of input.attachments) {
            await createIntakeAttachment({
              intakeId,
              fileUrl: attachment.fileUrl,
              fileKey: attachment.fileKey,
              fileName: attachment.fileName,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
            });
          }
        }

        // Send notification to owner
        // IMPROVED: Business logic extracted to service layer
        const notification = formatIntakeNotification(input);
        await notifyOwner(notification);

        return { projectId, intakeId, success: true };
      }),

    /**
     * Get intake form by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getIntakeFormByProjectId(input.projectId);
      }),

    /**
     * Get intake attachments
     * Note: This should also verify project access through the intakeId
     */
    getAttachments: protectedProcedure  // CHANGED: from publicProcedure
      .input(z.object({ intakeId: z.number() }))
      .query(async ({ input, ctx }) => {
        // First get the intake form to find the project
        const intake = await getIntakeFormByProjectId(input.intakeId);
        if (!intake) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Intake form not found" });
        }

        // Verify access to the project
        await verifyProjectAccess(intake.projectId, ctx.user);

        return await getIntakeAttachments(input.intakeId);
      }),
  }),

  quotes: router({
    /**
     * Create quote (admin only)
     */
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          amount: z.number(),
          breakdown: z.string().optional(),
          clarifyingQuestions: z.string().optional(),
          estimatedDuration: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create quotes
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create quotes" });
        }

        const quoteId = await createQuote({
          ...input,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        return { quoteId, success: true };
      }),

    /**
     * Get quotes by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getQuotesByProjectId(input.projectId);
      }),

    /**
     * Update quote status
     * FIXED: Proper typing and authorization
     */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "approved", "rejected"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get quote to find associated project
        const quotes = await getQuotesByProjectId(input.id);
        const quote = quotes.find(q => q.id === input.id);

        if (!quote) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
        }

        // Verify access to project
        await verifyProjectAccess(quote.projectId, ctx.user);

        await updateQuoteStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============= DESIGN (Step 2) =============
  designs: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          designTheme: z.string().optional(),
          mockupUrl: z.string().optional(),
          iconsFonts: z.string().optional(),
          designNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create designs
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create designs" });
        }

        const designId = await createDesign(input);
        await updateProjectStatus(input.projectId, "design");
        return { designId, success: true };
      }),

    /**
     * Get designs by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getDesignsByProjectId(input.projectId);
      }),

    /**
     * Update design
     * FIXED: Removed 'as any' type assertion
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          designTheme: z.string().optional(),
          mockupUrl: z.string().optional(),
          iconsFonts: z.string().optional(),
          designNotes: z.string().optional(),
          status: z.enum(["draft", "submitted", "approved", "revision_requested"]).optional(),
          revisionNumber: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can update designs
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update designs" });
        }

        const { id, ...data } = input;
        // FIXED: Properly typed, no 'as any' needed
        await updateDesign(id, data);
        return { success: true };
      }),
  }),

  // ============= STATUS UPDATES (Step 3) =============
  statusUpdates: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          updateType: z.enum(["status", "approval", "inquiry", "upsell"]),
          message: z.string().min(1),
          nextSteps: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create status updates
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create status updates" });
        }

        const updateId = await createStatusUpdate({
          ...input,
          sentBy: ctx.user.id,
        });

        await updateProjectStatus(input.projectId, "approval");
        return { updateId, success: true };
      }),

    /**
     * Get status updates by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getStatusUpdatesByProjectId(input.projectId);
      }),
  }),

  // ============= PRODUCTION (Step 4) =============
  production: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          checklist: z.string().optional(),
          engraverSettings: z.string().optional(),
          packagingSetup: z.string().optional(),
          estimatedCompletionDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create production setups
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create production setups" });
        }

        const setupId = await createProductionSetup({
          ...input,
          estimatedCompletionDate: input.estimatedCompletionDate
            ? new Date(input.estimatedCompletionDate)
            : undefined,
        });

        await updateProjectStatus(input.projectId, "production");
        return { setupId, success: true };
      }),

    /**
     * Get production setup by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getProductionSetupByProjectId(input.projectId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          checklist: z.string().optional(),
          engraverSettings: z.string().optional(),
          packagingSetup: z.string().optional(),
          materialsPrepared: z.number().optional(),
          estimatedCompletionDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can update production setups
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update production setups" });
        }

        const { id, ...data } = input;
        await updateProductionSetup(id, {
          ...data,
          estimatedCompletionDate: data.estimatedCompletionDate
            ? new Date(data.estimatedCompletionDate)
            : undefined,
        });

        return { success: true };
      }),
  }),

  // ============= FULFILLMENT (Step 5) =============
  fulfillment: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          thankYouMessage: z.string().optional(),
          careInstructions: z.string().optional(),
          packagingNotes: z.string().optional(),
          shippingMethod: z.string().optional(),
          trackingNumber: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create fulfillments
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create fulfillments" });
        }

        const fulfillmentId = await createFulfillment(input);
        await updateProjectStatus(input.projectId, "fulfillment");
        return { fulfillmentId, success: true };
      }),

    /**
     * Get fulfillment by project ID
     * FIXED: Added authorization check
     */
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getFulfillmentByProjectId(input.projectId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          thankYouMessage: z.string().optional(),
          careInstructions: z.string().optional(),
          packagingNotes: z.string().optional(),
          shippingMethod: z.string().optional(),
          trackingNumber: z.string().optional(),
          shippedDate: z.string().optional(),
          deliveredDate: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can update fulfillments
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update fulfillments" });
        }

        const { id, ...data } = input;
        await updateFulfillment(id, {
          ...data,
          shippedDate: data.shippedDate ? new Date(data.shippedDate) : undefined,
          deliveredDate: data.deliveredDate ? new Date(data.deliveredDate) : undefined,
        });

        if (data.deliveredDate) {
          const fulfillment = await getFulfillmentByProjectId(input.id);
          if (fulfillment) {
            await updateProjectStatus(fulfillment.projectId, "completed");
          }
        }

        return { success: true };
      }),
  }),

  // ============= STRIPE PAYMENTS =============
  stripe: stripeRouter,

  // ============= PORTFOLIO =============
  portfolio: router({
    list: publicProcedure.query(async () => {
      return await getAllPortfolioItems();
    }),

    featured: publicProcedure.query(async () => {
      return await getFeaturedPortfolioItems();
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          imageUrl: z.string().url(),
          category: z.string().optional(),
          featured: z.boolean().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create portfolio items
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create portfolio items" });
        }

        const itemId = await createPortfolioItem({
          ...input,
          featured: input.featured ? 1 : 0,
        });

        return { itemId, success: true };
      }),
  }),

  // ============= MESSAGES =============
  messages: router({
    /**
     * List messages for a project
     * FIXED: Added authorization check
     */
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getProjectMessages(input.projectId);
      }),

    /**
     * Create a new message
     * FIXED: Added authorization check
     */
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          message: z.string().min(1),
          attachments: z.array(z.object({
            fileName: z.string(),
            fileUrl: z.string(),
            fileType: z.string().optional(),
            fileSize: z.number().optional(),
          })).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");

        // Verify user has access to this project
        await verifyProjectAccess(input.projectId, ctx.user);

        const messageId = await createProjectMessage({
          projectId: input.projectId,
          senderOpenId: ctx.user.openId,
          senderName: ctx.user.name || "Unknown",
          senderRole: ctx.user.role || "user",
          message: input.message,
        });

        // Notify owner of new client message if sender is not admin
        if (ctx.user.role !== "admin") {
          await notifyOwner({
            title: "New Client Message",
            content: `${ctx.user.name} sent a message on project #${input.projectId}:\n\n${input.message}`,
          });
        }

        return { messageId, success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
