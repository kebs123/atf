import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const unitsRouter = Router();

unitsRouter.use(requireAuth, requireRole("manufacturer"));

unitsRouter.get("/:id", notImplemented);
unitsRouter.get("/:id/custody", notImplemented);
