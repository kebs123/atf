import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export function notImplemented(_req: Request, res: Response): void {
  res.status(501).json({ error: "Not implemented" });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  if (status >= 500) {
    console.error({ requestId: req.requestId, err });
  }

  res.status(status).json({
    error: status >= 500 ? "Kebs is having a problem. Try again or SMS." : message,
    requestId: req.requestId,
  });
}
