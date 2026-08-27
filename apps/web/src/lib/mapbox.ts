let runtimeToken = "";
let runtimeStyle = "";

export async function loadMapboxConfig() {
  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { mapboxAccessToken?: unknown; mapboxStyle?: unknown };
    if (typeof data.mapboxAccessToken === "string") runtimeToken = data.mapboxAccessToken.trim();
    if (typeof data.mapboxStyle === "string") runtimeStyle = data.mapboxStyle.trim();
  } catch {
    /* Vite has no Worker; fall back to VITE_* from .env */
  }
}

export function mapboxToken(): string {
  return runtimeToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() || "";
}

/** Studio Style URL, e.g. mapbox://styles/lil-mast/<id> for the custom "Streets" style. */
export function mapboxStyle(): string {
  const custom = runtimeStyle || import.meta.env.VITE_MAPBOX_STYLE?.trim();
  if (custom) return custom;
  return "mapbox://styles/mapbox/streets-v12";
}
