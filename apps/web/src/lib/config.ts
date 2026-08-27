export function apiOrigin(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

/** Browser always calls same origin `/api`. Vite (dev) and the Worker (prod) proxy to Express. */
export function apiRoot(): string {
  return "";
}

export function smsKeyword(): string {
  const raw = import.meta.env.VITE_SMS_KEYWORD?.trim();
  return raw && raw.length > 0 ? raw.toUpperCase() : "KEBS";
}

export function smsShortcode(): string {
  return import.meta.env.VITE_SMS_SHORTCODE?.trim() || "20880";
}

export function smsHint(): string {
  return `SMS ${smsKeyword()} <code> to ${smsShortcode()}`;
}
