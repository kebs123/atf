import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const verifyRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checks. Wait a minute." },
});

export const smsWebhookRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const from = typeof req.body?.from === "string" ? req.body.from : undefined;
    if (from) {
      return from;
    }
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { error: "Too many SMS checks. Wait a minute." },
});
