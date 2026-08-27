import africastalking from "africastalking";
import { env } from "../config/env";
import type { VerificationResult } from "../types";

interface InboundSms {
  from: string;
  text: string;
  to?: string;
  id?: string;
}

let client: ReturnType<typeof africastalking> | null = null;

function getClient(): ReturnType<typeof africastalking> | null {
  if (!env.smsApiKey) {
    return null;
  }
  if (!client) {
    client = africastalking({
      apiKey: env.smsApiKey,
      username: env.smsUsername,
    });
  }
  return client;
}

export function parseInbound(body: Record<string, unknown>): InboundSms {
  const from = String(body.from ?? body.From ?? "");
  const text = String(body.text ?? body.message ?? body.Text ?? "");
  const to = body.to !== undefined ? String(body.to) : undefined;
  const id = body.id !== undefined ? String(body.id) : body.messageId !== undefined ? String(body.messageId) : undefined;

  if (!from || !text) {
    throw new Error("SMS payload missing from or text");
  }

  return { from, text, to, id };
}

export function buildReply(
  result: VerificationResult,
  details: { product?: string | null; expiresAt?: string | null; batchNumber?: string | null; firstVerifiedAt?: string | null },
): string {
  switch (result) {
    case "genuine":
      return `KEBS: Genuine. ${details.product ?? "Product"}. Exp ${details.expiresAt ?? "-"}. Batch ${details.batchNumber ?? "-"}. First check. If pack looks tampered, do not use.`;
    case "already_verified":
      return `KEBS: WARNING. Code first checked ${details.firstVerifiedAt ?? "previously"}. If that was not you, do not use this product.`;
    case "recalled":
      return `KEBS: RECALLED. Do not use. Return to seller. Batch ${details.batchNumber ?? "-"}.`;
    case "expired":
      return `KEBS: EXPIRED ${details.expiresAt ?? ""}. Do not use.`;
    case "unknown":
      return "KEBS: Code not found. Check digits. If print is clear, do not buy.";
    case "flagged":
      return "KEBS: Do not use. This code is under review.";
  }
}

export async function sendSms(to: string, message: string): Promise<void> {
  const sms = getClient();
  if (!sms) {
    console.warn("SMS_API_KEY not set; skipping outbound SMS", { to });
    return;
  }

  await sms.SMS.send({
    to,
    message,
    from: env.smsShortcode,
  });
}
