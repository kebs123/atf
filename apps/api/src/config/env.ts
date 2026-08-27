import path from "node:path";
import dotenv from "dotenv";

// Works from src (tsx) and dist (node): both are one level below the package root.
const apiRoot = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(apiRoot, "..", "..");

// apps/api/.env wins; the repo-root .env is a shared fallback.
dotenv.config({
  path: [path.join(apiRoot, ".env"), path.join(repoRoot, ".env")],
  quiet: true,
});

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

// Relative to the package, not the shell's cwd, so `npm run dev` works from anywhere.
const databasePath = path.resolve(apiRoot, optional("DATABASE_PATH", "./data/kebs.db"));
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
  publicApiUrl: optional("PUBLIC_API_URL"),
  // Hops of trusted reverse proxy in front of the API (tunnel, nginx, load balancer).
  // 0 = trust nobody: X-Forwarded-For is ignored so a client cannot spoof its IP past the rate limiter.
  trustProxy: Number(optional("TRUST_PROXY", "0")),
  verifyFlagThreshold: Number(optional("VERIFY_FLAG_THRESHOLD", "5")),
} as const;
