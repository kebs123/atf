import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const batchesRouter = Router();

batchesRouter.use(requireAuth);

batchesRouter.post("/", requireRole("manufacturer"), notImplemented);
batchesRouter.get("/:id", requireRole("manufacturer"), notImplemented);
batchesRouter.post("/:id/codes", requireRole("manufacturer"), notImplemented);
batchesRouter.get("/:id/codes.csv", requireRole("manufacturer"), notImplemented);
batchesRouter.post("/:id/recall", requireRole("manufacturer", "admin"), notImplemented);
batchesRouter.get("/:id/stats", requireRole("manufacturer"), notImplemented);
