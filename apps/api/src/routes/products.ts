import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";

export const productsRouter = Router();

productsRouter.use(requireAuth, requireRole("manufacturer"));

productsRouter.get("/", notImplemented);
productsRouter.post("/", notImplemented);
productsRouter.get("/:id", notImplemented);
