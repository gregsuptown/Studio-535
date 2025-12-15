import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { getDb, getProjectById } from "./db";
import { orders, orderItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "./invoice-generator";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { projects } from "../drizzle/schema";

// Lazy initialization of Stripe - only when needed
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured. Please contact support."
      });
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: "2025-10-29.clover",
    });
  }
  return _stripe;
}

// Product catalog
interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  category: "product" | "service";
  imageUrl?: string;
}

const PRODUCTS: ProductDefinition[] = [
  {
    id: "custom-engraving-small",
    name: "Custom Engraving - Small",
    description: "Personalized engraving on wood, metal, or acrylic up to 6x6 inches",
    price: 7500, // $75.00
    currency: "USD",
    category: "product",
  },
  {
    id: "custom-engraving-large",
    name: "Custom Engraving - Large",
    description: "Personalized engraving on wood, metal, or acrylic up to 12x12 inches",
    price: 15000, // $150.00
    currency: "USD",
    category: "product",
  },
  {
    id: "custom-fabrication",
    name: "Custom Fabrication Project",
    description: "Bespoke furniture or fixture design and fabrication",
    price: 50000, // $500.00
    currency: "USD",
    category: "service",
  },
  {
    id: "design-consultation",
    name: "Design Consultation",
    description: "One-hour design consultation with mockup development",
    price: 12500, // $125.00
    currency: "USD",
    category: "service",
  },
  {
    id: "laser-cutting",
    name: "Laser Cutting Service",
    description: "Precision laser cutting for custom shapes and patterns",
    price: 10000, // $100.00
    currency: "USD",
    category: "service",
  },
  {
    id: "rush-production",
    name: "Rush Production (Add-on)",
    description: "Expedited production with 48-hour turnaround",
    price: 20000, // $200.00
    currency: "USD",
    category: "service",
  },
];

export const stripeRouter = router({
  /**
   * Get product catalog
   */
  getProducts: publicProcedure.query(() => {
    return PRODUCTS;
  }),

  /**
   * Create checkout session for product purchase
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const product = PRODUCTS.find((p) => p.id === input.productId);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const user = ctx.user;
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Must be logged in to purchase" });
      }

      // Create order record
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const orderNumber = `ORD-${Date.now()}`;
      const invoiceNumber = generateInvoiceNumber();
      const subtotal = product.price * input.quantity;
      const total = subtotal;

      const [order] = await db.insert(orders).values({
        orderNumber,
        invoiceNumber,
        userId: user.id,
        customerName: user.name || "Customer",
        customerEmail: user.email || "",
        orderType: "product",
        status: "pending",
        subtotal,
        tax: 0,
        total,
        currency: product.currency,
      });

      await db.insert(orderItems).values({
        orderId: order.insertId,
        productId: product.id,
        productName: product.name,
        description: product.description,
        quantity: input.quantity,
        unitPrice: product.price,
        total: subtotal,
      });

      // Create Stripe checkout session
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency.toLowerCase(),
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: input.quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/shop`,
        customer_email: user.email || undefined,
        metadata: {
          orderId: order.insertId.toString(),
          orderNumber,
          invoiceNumber,
          userId: user.id.toString(),
        },
      });

      // Update order with session ID
      await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.insertId));

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Create checkout session for project deposit (10%)
   */
  createDepositSession: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        totalAmount: z.number(), // in cents
      })
    )
    .mutation(async ({ input, ctx }) => {
      // SECURITY FIX: Verify user has access to this project
      const project = await getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const isOwner = project.clientEmail === ctx.user.email;
      const isAdmin = ctx.user.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create payments for this project"
        });
      }

      const depositAmount = Math.round(input.totalAmount * 0.1); // 10% deposit
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const orderNumber = `ORD-${Date.now()}`;
      const invoiceNumber = generateInvoiceNumber();

      const [order] = await db.insert(orders).values({
        orderNumber,
        invoiceNumber,
        userId: ctx.user.id,
        projectId: input.projectId,
        customerName: ctx.user.name || "Customer",
        customerEmail: ctx.user.email || "",
        orderType: "deposit",
        status: "pending",
        subtotal: depositAmount,
        tax: 0,
        total: depositAmount,
        currency: "USD",
      });

      await db.insert(orderItems).values({
        orderId: order.insertId,
        productId: `project-${input.projectId}-deposit`,
        productName: "Project Deposit (10%)",
        description: `Deposit payment for project #${input.projectId}`,
        quantity: 1,
        unitPrice: depositAmount,
        total: depositAmount,
      });

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Project Deposit (10%)",
                description: `Deposit for project #${input.projectId}`,
              },
              unit_amount: depositAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/admin/project/${input.projectId}`,
        customer_email: ctx.user.email || undefined,
        metadata: {
          orderId: order.insertId.toString(),
          orderNumber,
          invoiceNumber,
          projectId: input.projectId.toString(),
          userId: ctx.user.id.toString(),
        },
      });

      await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.insertId));

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Create checkout session for project balance (90%)
   */
  createBalanceSession: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        totalAmount: z.number(), // in cents
      })
    )
    .mutation(async ({ input, ctx }) => {
      // SECURITY FIX: Verify user has access to this project
      const project = await getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const isOwner = project.clientEmail === ctx.user.email;
      const isAdmin = ctx.user.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create payments for this project"
        });
      }

      const balanceAmount = Math.round(input.totalAmount * 0.9); // 90% balance
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const orderNumber = `ORD-${Date.now()}`;
      const invoiceNumber = generateInvoiceNumber();

      const [order] = await db.insert(orders).values({
        orderNumber,
        invoiceNumber,
        userId: ctx.user.id,
        projectId: input.projectId,
        customerName: ctx.user.name || "Customer",
        customerEmail: ctx.user.email || "",
        orderType: "balance",
        status: "pending",
        subtotal: balanceAmount,
        tax: 0,
        total: balanceAmount,
        currency: "USD",
      });

      await db.insert(orderItems).values({
        orderId: order.insertId,
        productId: `project-${input.projectId}-balance`,
        productName: "Project Balance (90%)",
        description: `Final payment for project #${input.projectId}`,
        quantity: 1,
        unitPrice: balanceAmount,
        total: balanceAmount,
      });

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Project Balance (90%)",
                description: `Final payment for project #${input.projectId}`,
              },
              unit_amount: balanceAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/admin/project/${input.projectId}`,
        customer_email: ctx.user.email || undefined,
        metadata: {
          orderId: order.insertId.toString(),
          orderNumber,
          invoiceNumber,
          projectId: input.projectId.toString(),
          userId: ctx.user.id.toString(),
        },
      });

      await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.insertId));

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get order history for current user
   */
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userOrders = await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(orders.createdAt);

    return userOrders;
  }),

  /**
   * Get all orders (admin only)
   */
  getAllOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const db = await getDb();
    if (!db) return [];

    const allOrders = await db.select().from(orders).orderBy(orders.createdAt);

    return allOrders;
  }),

  /**
   * Get orders for a specific project
   */
  getOrdersByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const projectOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.projectId, input.projectId))
        .orderBy(orders.createdAt);

      return projectOrders;
    }),
});

/**
 * Handle Stripe webhook events
 * This function is called from server/_core/index.ts
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = parseInt(session.metadata?.orderId || "0");

        if (!orderId) {
          console.error("[Stripe Webhook] No orderId in session metadata");
          return;
        }

        const db = await getDb();
        if (!db) {
          console.error("[Stripe Webhook] Database unavailable");
          return;
        }

        // Update order status
        await db
          .update(orders)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string,
          })
          .where(eq(orders.id, orderId));

        // Get order details
        const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
        if (!order) {
          console.error(`[Stripe Webhook] Order ${orderId} not found`);
          return;
        }

        // Get order items
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

        // Generate invoice PDF
        const invoiceData: InvoiceData = {
          invoiceNumber: order.invoiceNumber,
          orderDate: order.createdAt,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: items.map((item) => ({
            name: item.productName,
            description: item.description || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          paymentMethod: "Credit Card (Stripe)",
          transactionId: session.payment_intent as string,
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Upload PDF to S3
        const pdfKey = `invoices/${order.invoiceNumber}.pdf`;
        const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");

        // Update order with PDF URL
        await db.update(orders).set({ invoicePdfUrl: pdfUrl, invoicePdfKey: pdfKey }).where(eq(orders.id, orderId));

        // Send notification to owner
        await notifyOwner({
          title: "New Order Received",
          content: `Order ${order.orderNumber} has been paid. Customer: ${order.customerName} (${order.customerEmail}). Total: $${(order.total / 100).toFixed(2)}. Invoice: ${pdfUrl}`,
        });

        console.log(`[Stripe Webhook] Order ${orderId} processed successfully. Invoice: ${pdfUrl}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("[Stripe Webhook] Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    throw error;
  }
}
