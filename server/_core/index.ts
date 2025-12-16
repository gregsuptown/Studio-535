import "dotenv/config";
console.log("Starting server application...");
import express from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerAuthRoutes } from "./auth-routes";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // ==========================================
  // SECURITY HEADERS (Priority 3)
  // ==========================================
  app.use((_req, res, next) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // XSS Protection (legacy browsers)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Permissions Policy (restrict browser features)
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self)"
    );
    
    // Content Security Policy (adjust as needed)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://api.stripe.com https://accounts.google.com",
          "frame-src 'self' https://js.stripe.com https://accounts.google.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ")
      );
      
      // HSTS (only in production with HTTPS)
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }
    
    next();
  });

  // ==========================================
  // RATE LIMITING (SECURITY FIX)
  // ==========================================

  // General API rate limiter - 100 requests per 15 minutes per IP
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip rate limiting for health checks
    skip: (req) => req.path === "/api/health",
  });

  // Strict rate limiter for authentication endpoints - 5 requests per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply general rate limiting to all API routes
  app.use("/api/", apiLimiter);

  // Apply strict rate limiting to authentication routes
  app.use("/api/auth/", authLimiter);

  // Stripe webhook endpoint (MUST be before body parser to get raw body)
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { stripeWebhookHandler } = await import("./stripe-webhook-endpoint");
      await stripeWebhookHandler(req, res);
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint for deployment platforms
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OAuth routes for Google and GitHub (FREE authentication)
  registerAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  if (process.env.NODE_ENV === "production") {
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${port}/`);
    });
  } else {
    const availablePort = await findAvailablePort(port);

    if (availablePort !== port) {
      console.log(`Port ${port} is busy, using port ${availablePort} instead`);
    }

    server.listen(availablePort, () => {
      console.log(`Server running on http://localhost:${availablePort}/`);
    });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
