import fs from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });

const adapter = new PrismaBetterSqlite3({
  url: env.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });

export async function initDb(): Promise<void> {
  await prisma.$connect();
  await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL");
  await prisma.$queryRawUnsafe("PRAGMA foreign_keys=ON");
}

export async function closeDb(): Promise<void> {
  await prisma.$disconnect();
}
