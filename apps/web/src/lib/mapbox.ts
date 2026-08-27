export function mapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";
}

/** Studio Style URL, e.g. mapbox://styles/lil-mast/<id> for the custom "Streets" style. */
export function mapboxStyle(): string {
  const custom = import.meta.env.VITE_MAPBOX_STYLE?.trim();
  if (custom) return custom;
  return "mapbox://styles/mapbox/streets-v12";
}
