import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

const databasePath = path.resolve(optional("DATABASE_PATH", "./data/kebs.db"));
const databaseUrl = `file:${databasePath.replace(/\\/g, "/")}`;

process.env.DATABASE_URL = databaseUrl;

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "3001")),
  databasePath,
  databaseUrl,
  jwtSecret: required("JWT_SECRET", "dev-only-change-me"),
  smsWebhookSecret: required("SMS_WEBHOOK_SECRET", "dev-only-change-me"),
  smsApiKey: optional("SMS_API_KEY"),
  smsUsername: optional("SMS_USERNAME", "sandbox"),
  smsShortcode: optional("SMS_SHORTCODE", "20880"),
  publicVerifyUrl: optional("PUBLIC_VERIFY_URL", "http://localhost:3000/verify"),
  verifyFlagThreshold: Number(optional("VERIFY_FLAG_THRESHOLD", "5")),
} as const;
