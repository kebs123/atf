import { createHash } from "node:crypto";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashPhone(msisdn: string): string {
  return createHash("sha256").update(msisdn.trim()).digest("hex");
}
