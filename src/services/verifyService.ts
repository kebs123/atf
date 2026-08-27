import type { VerifyInput, VerifyOutput } from "../types";
import { HttpError } from "../middleware/errorHandler";

/**
 * Shared verification brain for POST /verify and POST /webhooks/sms.
 * Outcome order: unknown → recalled → flagged → expired → genuine → already_verified.
 */
export async function verifyCode(_input: VerifyInput): Promise<VerifyOutput> {
  throw new HttpError(501, "verifyService.verifyCode is not implemented");
}
