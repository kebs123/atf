import { Router } from "express";
import { smsSignature } from "../middleware/smsSignature";
import { smsWebhookRateLimit } from "../middleware/rateLimit";
import * as smsService from "../services/smsService";
import * as verifyService from "../services/verifyService";

export const webhooksRouter = Router();

webhooksRouter.post("/sms", smsWebhookRateLimit, smsSignature, async (req, res) => {
  const inbound = smsService.parseInbound(req.body as Record<string, unknown>);
  const verification = await verifyService.verifyCode({
    code: inbound.text,
    channel: "sms",
    actorPhone: inbound.from,
    gatewayMessageId: inbound.id,
  });

  const message = smsService.buildReply(verification.result, {
    product: verification.productName,
    expiresAt: verification.expiresAt,
    batchNumber: verification.batchNumber,
    firstVerifiedAt: verification.firstVerifiedAt,
  });

  res.status(200).json({ ok: true, result: verification.result });

  void smsService.sendSms(inbound.from, message).catch((err: unknown) => {
    console.error("Failed to send SMS reply", err);
  });
});
