import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function smsSignature(req: Request, res: Response, next: NextFunction): void {
  const secret =
    req.header("x-sms-webhook-secret") ??
    req.header("x-api-key") ??
    (typeof req.body?.secret === "string" ? req.body.secret : undefined);

  if (secret !== env.smsWebhookSecret) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  next();
}
