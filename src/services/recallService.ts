import { HttpError } from "../middleware/errorHandler";

/**
 * Set batch status to recalled and overwrite unit statuses to recalled.
 */
export async function recall(_batchId: number, _reason?: string): Promise<void> {
  throw new HttpError(501, "recallService.recall is not implemented");
}
