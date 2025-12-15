import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "H4QVmWV8yUYXjmz.root",
    password: "hClcTcbkYgB3seLY",
    database: "test",
    ssl: {
      rejectUnauthorized: true,
    },
  },
});
