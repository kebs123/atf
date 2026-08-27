import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { notImplemented } from "../middleware/errorHandler";
import { authRouter } from "./auth";
import { productsRouter } from "./products";
import { batchesRouter } from "./batches";
import { verifyRouter } from "./verify";
import { reportsRouter } from "./reports";
import { webhooksRouter } from "./webhooks";
import { statsRouter } from "./stats";
import { adminRouter } from "./admin";
import { custodyRouter } from "./custody";
import { unitsRouter } from "./units";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/batches", batchesRouter);
apiRouter.use("/verify", verifyRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/webhooks", webhooksRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/verifications", requireAuth, requireRole("manufacturer"), notImplemented);
apiRouter.use("/alerts", requireAuth, requireRole("manufacturer"), notImplemented);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/custody", custodyRouter);
apiRouter.use("/units", unitsRouter);
