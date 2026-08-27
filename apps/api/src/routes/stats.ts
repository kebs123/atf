import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const statsRouter = Router();

statsRouter.use(requireAuth, requireRole("manufacturer"));

statsRouter.get("/overview", notImplemented);
