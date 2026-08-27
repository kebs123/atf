import { Router } from "express";
import { verifyRateLimit } from "../middleware/rateLimit";
import * as verifyService from "../services/verifyService";

export const verifyRouter = Router();

verifyRouter.post("/", verifyRateLimit, async (req, res) => {
  const result = await verifyService.verifyCode({
    code: String(req.body?.code ?? ""),
    channel: "web",
    actorIp: req.ip,
  });
  res.json(result);
});
