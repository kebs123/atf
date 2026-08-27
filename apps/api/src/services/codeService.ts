import { HttpError } from "../middleware/errorHandler";

/**
 * Read batches.quantity, insert that many units, set codes_generated.
 * v1: one-shot generation only.
 */
export async function generate(_batchId: number): Promise<{ generated: number }> {
  throw new HttpError(501, "codeService.generate is not implemented");
}

export async function exportCsv(_batchId: number): Promise<string> {
  throw new HttpError(501, "codeService.exportCsv is not implemented");
}
