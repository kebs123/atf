import { Router } from "express";
import { notImplemented } from "../middleware/errorHandler";

export const reportsRouter = Router();

reportsRouter.post("/", notImplemented);
