/**
 * Client for the Kebs API (apps/api). Base URL comes from VITE_API_URL so the
 * same build can point at localhost or a tunnel without code changes.
 */
const RAW_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export const API_BASE = RAW_BASE.replace(/\/+$/, "");

/** Every outcome the backend can return. Only `genuine` is good news. */
export type VerificationResult =
  | "genuine"
  | "already_verified"
  | "recalled"
  | "expired"
  | "unknown"
  | "flagged";

export interface VerifyResponse {
  result: VerificationResult;
  productName: string | null;
  batchNumber: string | null;
  expiresAt: string | null;
  firstVerifiedAt: string | null;
  /** Consumer-facing text, identical to what the SMS and USSD doors send. */
  message: string;
}

export class ApiError extends Error {
  status: number;
  requestId?: string;

  constructor(status: number, message: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

async function readError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  let requestId: string | undefined;

  try {
    const body = (await response.json()) as { error?: string; requestId?: string };
    if (body.error) {
      message = body.error;
    }
    requestId = body.requestId;
  } catch {
    // Non-JSON error body (proxy or gateway page): keep the generic message.
  }

  if (response.status === 429) {
    message = "Too many checks from this device. Wait a minute and try again.";
  }

  return new ApiError(response.status, message, requestId);
}

export async function verifyCode(code: string, signal?: AbortSignal): Promise<VerifyResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    // Server down, wrong port, DNS, blocked request: all look the same to fetch.
    throw new ApiError(0, `Cannot reach the Kebs API at ${API_BASE}. Is the server running?`);
  }

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as VerifyResponse;
}
