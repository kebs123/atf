import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const existing = req.header("x-request-id");
  req.requestId = existing && existing.length > 0 ? existing : randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}
