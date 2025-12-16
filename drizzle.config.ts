import { defineConfig } from "drizzle-kit";

// Parse DATABASE_URL to extract connection details
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const url = new URL(DATABASE_URL);
const host = url.hostname;
const port = parseInt(url.port);
const user = url.username;
const password = url.password;
const database = url.pathname.slice(1); // Remove leading slash

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: true,
    },
  },
});
