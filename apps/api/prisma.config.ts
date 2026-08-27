import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma runs with cwd = apps/api; fall back to the repo-root .env.
dotenv.config({ path: [".env", "../../.env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
