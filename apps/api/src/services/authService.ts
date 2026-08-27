import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser, User } from "../types";
import { HttpError } from "../middleware/errorHandler";

export interface RegisterInput {
  companyName: string;
  country: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(_input: RegisterInput): Promise<AuthUser> {
  throw new HttpError(501, "authService.register is not implemented");
}

export async function login(_input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  throw new HttpError(501, "authService.login is not implemented");
}

export function issueToken(user: AuthUser): string {
  return jwt.sign(user, env.jwtSecret, { expiresIn: "7d" });
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    role: user.role,
  };
}
