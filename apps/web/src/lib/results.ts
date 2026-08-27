import { CATEGORIES, type CategoryId } from "@/lib/categories";

export type ResultCode =
  | "genuine"
  | "already_verified"
  | "recalled"
  | "expired"
  | "unknown"
  | "flagged";

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  "personal-care": "hsl(25 48% 48%)",
  "food-alcoholic-drinks": "hsl(35 52% 42%)",
  "construction-materials": "hsl(18 28% 34%)",
  "automotive-parts": "hsl(12 42% 46%)",
};

export function asCategory(raw: unknown): CategoryId {
  const s = String(raw ?? "");
  if ((CATEGORIES as readonly { id: string }[]).some((c) => c.id === s)) return s as CategoryId;
  return "personal-care";
}

export function asResult(raw: unknown): ResultCode {
  const s = String(raw ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (s === "authentic" || s === "valid" || s === "ok") return "genuine";
  if (s === "already_used" || s === "used" || s === "warning") return "already_verified";
  if (s === "not_found" || s === "invalid" || s === "counterfeit") return "unknown";
  if (
    s === "genuine" ||
    s === "already_verified" ||
    s === "recalled" ||
    s === "expired" ||
    s === "unknown" ||
    s === "flagged"
  ) {
    return s;
  }
  return "unknown";
}

export function resultLabel(result: ResultCode) {
  switch (result) {
    case "genuine":
      return "Genuine";
    case "already_verified":
      return "Warning";
    case "recalled":
      return "Recalled";
    case "expired":
      return "Expired";
    case "unknown":
      return "Not found";
    case "flagged":
      return "Flagged";
  }
}

export function resultClass(result: ResultCode) {
  switch (result) {
    case "genuine":
      return "bg-primary/15 text-foreground border-primary/30";
    case "already_verified":
      return "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30";
    case "recalled":
    case "expired":
    case "flagged":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "unknown":
      return "bg-secondary text-foreground border-border";
  }
}

export function categoryTotals(series: { values: Record<CategoryId, number> }[]) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>;
  for (const row of series) {
    for (const c of CATEGORIES) totals[c.id] += row.values[c.id] ?? 0;
  }
  return totals;
}

export function emptyCategoryValues(): Record<CategoryId, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>;
}
