import { randomInt } from "node:crypto";

export const CODE_LENGTH = 8;
export const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/^KEBS\s+/i, "")
    .replace(/[\s-]/g, "");
}

export function isValidCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false;
  }
  return [...code].every((char) => CODE_ALPHABET.includes(char));
}

export function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}
