import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const custodyRouter = Router();

custodyRouter.post("/", requireAuth, requireRole("manufacturer", "retailer"), notImplemented);
