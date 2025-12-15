import { stripeRouter } from "./stripe-router";
import { catalogRouter } from "./catalog-router";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./_core/auth-router";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
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
  createMessageAttachment,
  getMessageAttachments,
} from "./db";

/**
 * SECURITY FIX: Helper function to verify project access
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

// Type-safe status enums to replace 'as any' casts
const projectStatusSchema = z.enum([
  "intake",
  "design",
  "approval",
  "production",
  "fulfillment",
  "completed",
  "cancelled"
]);

const quoteStatusSchema = z.enum(["draft", "sent", "approved", "rejected"]);

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,

  // ============= PROJECTS =============
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Admin sees all, regular users see their own
      const allProjects = await getAllProjects();
      if (ctx.user.role === "admin") {
        return allProjects;
      }
      return allProjects.filter(p => p.clientEmail === ctx.user.email);
    }),

    getMyProjects: protectedProcedure.query(async ({ ctx }) => {
      // Get projects for the current logged-in user
      const allProjects = await getAllProjects();
      return allProjects.filter(p => p.clientEmail === ctx.user.email);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
        await verifyProjectAccess(input.id, ctx.user);
        return await getProjectById(input.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: projectStatusSchema }))
      .mutation(async ({ input, ctx }) => {
        // SECURITY FIX: Only admins can update project status
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

        // Send notification to owner about new project inquiry
        const attachmentInfo = input.attachments && input.attachments.length > 0
          ? `\n\n📎 Attachments: ${input.attachments.length} file(s) uploaded`
          : "";
        
        const projectDetails = [
          `**Client Information:**`,
          `Name: ${input.clientName}`,
          `Email: ${input.clientEmail}`,
          input.clientPhone ? `Phone: ${input.clientPhone}` : null,
          ``,
          `**Project Details:**`,
          `Title: ${input.projectTitle}`,
          input.projectType ? `Type: ${input.projectType}` : null,
          ``,
          `**Description:**`,
          input.rawMessage,
          ``,
          input.material ? `Material: ${input.material}` : null,
          input.dimensions ? `Dimensions: ${input.dimensions}` : null,
          input.quantity ? `Quantity: ${input.quantity}` : null,
          input.deadline ? `Deadline: ${input.deadline}` : null,
          input.budget ? `Budget: ${input.budget}` : null,
          input.specialRequirements ? `\nSpecial Requirements:\n${input.specialRequirements}` : null,
          attachmentInfo,
        ].filter(Boolean).join('\n');

        await notifyOwner({
          title: `🎨 New Project Inquiry: ${input.projectTitle}`,
          content: projectDetails,
        });

        return { projectId, intakeId, success: true };
      }),

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getIntakeFormByProjectId(input.projectId);
      }),

    getAttachments: protectedProcedure
      .input(z.object({ intakeId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify access through intake form
        const intake = await getIntakeFormByProjectId(input.intakeId);
        if (intake) {
          await verifyProjectAccess(intake.projectId, ctx.user);
        }
        return await getIntakeAttachments(input.intakeId);
      }),
  }),

  quotes: router({
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
        // SECURITY FIX: Only admins can create quotes
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create quotes" });
        }
        const quoteId = await createQuote({
          ...input,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        return { quoteId, success: true };
      }),

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getQuotesByProjectId(input.projectId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: quoteStatusSchema }))
      .mutation(async ({ input }) => {
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
        // SECURITY FIX: Only admins can create designs
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create designs" });
        }
        const designId = await createDesign(input);
        await updateProjectStatus(input.projectId, "design");
        return { designId, success: true };
      }),

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
        await verifyProjectAccess(input.projectId, ctx.user);
        return await getDesignsByProjectId(input.projectId);
      }),

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
        // SECURITY FIX: Only admins can update designs
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update designs" });
        }
        const { id, ...data } = input;
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
        // SECURITY FIX: Only admins can create status updates
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

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
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
        // SECURITY FIX: Only admins can create production setups
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

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
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
        // SECURITY FIX: Only admins can update production setups
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
        // SECURITY FIX: Only admins can create fulfillments
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create fulfillments" });
        }
        const fulfillmentId = await createFulfillment(input);
        await updateProjectStatus(input.projectId, "fulfillment");
        return { fulfillmentId, success: true };
      }),

    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
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
        // SECURITY FIX: Only admins can update fulfillments
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

  // ============= PRODUCT CATALOG =============
  catalog: catalogRouter,

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
        // SECURITY FIX: Only admins can create portfolio items
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
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        // SECURITY FIX: Verify user has access to this project
        await verifyProjectAccess(input.projectId, ctx.user);
        const messages = await getProjectMessages(input.projectId);

        // Fetch attachments for each message
        const messagesWithAttachments = await Promise.all(
          messages.map(async (message) => {
            const attachments = await getMessageAttachments(message.id);
            return { ...message, attachments };
          })
        );

        return messagesWithAttachments;
      }),

    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          fileType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");

        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');

        // Generate unique file key
        const timestamp = Date.now();
        const fileKey = `message-attachments/${ctx.user.id}/${timestamp}-${input.fileName}`;

        // Upload to storage
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        return {
          fileUrl: url,
          fileKey,
          fileName: input.fileName,
          fileSize: buffer.length,
        };
      }),

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

        // SECURITY FIX: Verify user has access to this project before creating message
        await verifyProjectAccess(input.projectId, ctx.user);

        const messageId = await createProjectMessage({
          projectId: input.projectId,
          senderId: ctx.user.id,
          senderName: ctx.user.name || "Unknown",
          senderRole: ctx.user.role || "user",
          message: input.message,
        });

        // Save attachments if provided
        if (input.attachments && input.attachments.length > 0) {
          for (const attachment of input.attachments) {
            await createMessageAttachment({
              messageId,
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            });
          }
        }

        // Notify owner of new client message if sender is not admin
        const attachmentInfo = input.attachments && input.attachments.length > 0
          ? `\n\n📎 ${input.attachments.length} file(s) attached`
          : "";
        if (ctx.user.role !== "admin") {
          await notifyOwner({
            title: "New Client Message",
            content: `${ctx.user.name} sent a message on project #${input.projectId}:\n\n${input.message}${attachmentInfo}`,
          });
        }

        return { messageId, success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
