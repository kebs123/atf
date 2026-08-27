import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser, UserRole } from "../types";

function readBearer(req: Request): string | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = readBearer(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = {
      id: payload.id,
      companyId: payload.companyId ?? null,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "You cannot do this." });
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readBearer(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = {
      id: payload.id,
      companyId: payload.companyId ?? null,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // Public routes still proceed without a user.
  }
  next();
}
