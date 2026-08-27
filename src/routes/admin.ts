import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/companies", notImplemented);
adminRouter.post("/companies/:id/approve", notImplemented);
adminRouter.post("/companies/:id/suspend", notImplemented);
adminRouter.get("/flags", notImplemented);
adminRouter.get("/reports", notImplemented);
adminRouter.get("/verifications", notImplemented);
