import { CATEGORIES, type CategoryId } from "@/lib/categories";

export type ResultCode =
  | "genuine"
  | "already_verified"
  | "recalled"
  | "expired"
  | "unknown"
  | "flagged";

export const MANUFACTURER_STATS = {
  products: 8,
  activeBatches: 11,
  codesIssued: 24600,
  checksThisWeek: 3184,
  openAlerts: 5,
};

export const RECENT_VERIFICATIONS = [
  { code: "H9C1L5W2", product: "Shea body butter 200ml", category: "personal-care" as CategoryId, result: "genuine" as ResultCode, channel: "sms", at: "Today 09:14" },
  { code: "A3N8R2T6", product: "Cooking oil 1L", category: "food-alcoholic-drinks" as CategoryId, result: "already_verified" as ResultCode, channel: "web", at: "Today 08:51" },
  { code: "C7M2T0Q1", product: "Lager 500ml", category: "food-alcoholic-drinks" as CategoryId, result: "genuine" as ResultCode, channel: "sms", at: "Today 08:12" },
  { code: "K4P9B1X8", product: "Cement 50kg", category: "construction-materials" as CategoryId, result: "genuine" as ResultCode, channel: "sms", at: "Yesterday 18:02" },
  { code: "FAKE0001", product: "—", category: "automotive-parts" as CategoryId, result: "unknown" as ResultCode, channel: "web", at: "Yesterday 16:40" },
  { code: "R1V8N3D5", product: "Brake pad set", category: "automotive-parts" as CategoryId, result: "flagged" as ResultCode, channel: "sms", at: "Yesterday 11:22" },
];

export const PRODUCTS = [
  { id: "p1", name: "Shea body butter 200ml", sku: "CARE-200", category: "personal-care" as CategoryId, batches: 2, codes: 4000, status: "Active" },
  { id: "p2", name: "Skin cream 50ml", sku: "CRM-50", category: "personal-care" as CategoryId, batches: 1, codes: 2400, status: "Active" },
  { id: "p3", name: "Cooking oil 1L", sku: "OIL-1L", category: "food-alcoholic-drinks" as CategoryId, batches: 2, codes: 6400, status: "Active" },
  { id: "p4", name: "Lager 500ml", sku: "LGR-500", category: "food-alcoholic-drinks" as CategoryId, batches: 2, codes: 5000, status: "Active" },
  { id: "p5", name: "Cement 50kg", sku: "CEM-50", category: "construction-materials" as CategoryId, batches: 2, codes: 3200, status: "Active" },
  { id: "p6", name: "Roofing sheet 3m", sku: "ROOF-3", category: "construction-materials" as CategoryId, batches: 1, codes: 1200, status: "Active" },
  { id: "p7", name: "Brake pad set", sku: "BRK-PAD", category: "automotive-parts" as CategoryId, batches: 1, codes: 1600, status: "Active" },
  { id: "p8", name: "Oil filter", sku: "OIL-FLT", category: "automotive-parts" as CategoryId, batches: 1, codes: 800, status: "Active" },
];

export const PRODUCT_BATCHES: Record<string, { id: string; lot: string; size: number; checks: number; expiry: string; status: string }[]> = {
  p1: [
    { id: "c09", lot: "C09", size: 2000, checks: 188, expiry: "2027-06-01", status: "Active" },
    { id: "c08", lot: "C08", size: 2000, checks: 94, expiry: "2027-01-12", status: "Active" },
  ],
  p2: [{ id: "s50", lot: "S50", size: 2400, checks: 77, expiry: "2027-03-01", status: "Active" }],
  p3: [
    { id: "f04", lot: "F04", size: 3200, checks: 410, expiry: "2027-01-15", status: "Active" },
    { id: "f03", lot: "F03", size: 3200, checks: 118, expiry: "2026-09-30", status: "Active" },
  ],
  p4: [
    { id: "l12", lot: "L12", size: 2500, checks: 620, expiry: "2026-12-01", status: "Active" },
    { id: "l11", lot: "L11", size: 2500, checks: 41, expiry: "2026-08-20", status: "Recalled" },
  ],
  p5: [
    { id: "b12", lot: "B12", size: 1600, checks: 212, expiry: "2028-03-01", status: "Active" },
    { id: "b11", lot: "B11", size: 1600, checks: 90, expiry: "2027-11-12", status: "Active" },
  ],
  p6: [{ id: "r03", lot: "R03", size: 1200, checks: 33, expiry: "2030-01-01", status: "Active" }],
  p7: [{ id: "a22", lot: "A22", size: 1600, checks: 156, expiry: "2029-05-01", status: "Active" }],
  p8: [{ id: "a18", lot: "A18", size: 800, checks: 44, expiry: "2028-08-01", status: "Active" }],
};

export const ALERTS = [
  { code: "R1V8N3D5", product: "Brake pad set", category: "automotive-parts" as CategoryId, reason: "verify_count 6", severity: "hot" as const, at: "Yesterday 11:22" },
  { code: "FAKE0001", product: "Unknown", category: "automotive-parts" as CategoryId, reason: "Not in system", severity: "unknown" as const, at: "Yesterday 16:40" },
  { code: "L11RECAL", product: "Lager 500ml", category: "food-alcoholic-drinks" as CategoryId, reason: "Batch recalled", severity: "flagged" as const, at: "2 days ago" },
  { code: "C7M2T0Q1", product: "Lager 500ml", category: "food-alcoholic-drinks" as CategoryId, reason: "verify_count 5", severity: "hot" as const, at: "3 days ago" },
  { code: "K4P9B1X8", product: "Cement 50kg", category: "construction-materials" as CategoryId, reason: "Unusual geography", severity: "flagged" as const, at: "4 days ago" },
];

export const SHIPMENTS = [
  { id: "s1", to: "Nairobi Central Depot", units: 2000, batch: "C09", category: "personal-care" as CategoryId, status: "In transit", at: "27 Aug 2026" },
  { id: "s2", to: "Mombasa Retail Co-op", units: 800, batch: "F04", category: "food-alcoholic-drinks" as CategoryId, status: "Received", at: "22 Aug 2026" },
  { id: "s3", to: "Kisumu Build Hub", units: 400, batch: "B12", category: "construction-materials" as CategoryId, status: "Packed", at: "20 Aug 2026" },
  { id: "s4", to: "Eldoret Auto Parts", units: 160, batch: "A22", category: "automotive-parts" as CategoryId, status: "Received", at: "18 Aug 2026" },
];

export const ADMIN_STATS = {
  pendingCompanies: 3,
  approvedCompanies: 18,
  flagsOpen: 11,
  checksToday: 4821,
};

export const COMPANIES = [
  { id: "c1", name: "Rift Valley Mills", email: "ops@rvm.ke", category: "food-alcoholic-drinks" as CategoryId, status: "pending" as const, applied: "26 Aug 2026" },
  { id: "c2", name: "Coastal Beauty Ltd", email: "hello@coastalbeauty.ke", category: "personal-care" as CategoryId, status: "pending" as const, applied: "25 Aug 2026" },
  { id: "c3", name: "Atlas Goods KE", email: "manufacturer@vero.demo", category: "personal-care" as CategoryId, status: "approved" as const, applied: "12 Jan 2026" },
  { id: "c4", name: "Savanna Cement", email: "qa@savannacement.ke", category: "construction-materials" as CategoryId, status: "suspended" as const, applied: "03 Mar 2026" },
  { id: "c5", name: "Highland Auto", email: "reg@highlandauto.ke", category: "automotive-parts" as CategoryId, status: "pending" as const, applied: "24 Aug 2026" },
];

export const ADMIN_FLAGS = [
  { code: "R1V8N3D5", company: "Highland Auto", category: "automotive-parts" as CategoryId, result: "flagged" as ResultCode, checks: 6, at: "Yesterday 11:22" },
  { code: "FAKE0001", company: "—", category: "automotive-parts" as CategoryId, result: "unknown" as ResultCode, checks: 14, at: "Yesterday 16:40" },
  { code: "ZZ99XX11", company: "—", category: "food-alcoholic-drinks" as CategoryId, result: "unknown" as ResultCode, checks: 9, at: "Yesterday 07:03" },
  { code: "L11RECAL", company: "Atlas Goods KE", category: "food-alcoholic-drinks" as CategoryId, result: "recalled" as ResultCode, checks: 5, at: "2 days ago" },
];

export const ADMIN_VERIFICATIONS = [
  { id: "v1", code: "H9C1L5W2", result: "genuine" as ResultCode, channel: "sms", company: "Atlas Goods KE", category: "personal-care" as CategoryId, at: "Today 09:14" },
  { id: "v2", code: "A3N8R2T6", result: "already_verified" as ResultCode, channel: "web", company: "Atlas Goods KE", category: "food-alcoholic-drinks" as CategoryId, at: "Today 08:51" },
  { id: "v3", code: "UNKN0002", result: "unknown" as ResultCode, channel: "sms", company: "—", category: "construction-materials" as CategoryId, at: "Today 08:12" },
  { id: "v4", code: "K4P9B1X8", result: "genuine" as ResultCode, channel: "sms", company: "Savanna Cement", category: "construction-materials" as CategoryId, at: "Yesterday 18:02" },
  { id: "v5", code: "L11RECAL", result: "recalled" as ResultCode, channel: "web", company: "Atlas Goods KE", category: "food-alcoholic-drinks" as CategoryId, at: "Yesterday 12:18" },
];

/** Last 14 days of checks, split by category — used by the interactive chart. */
export const CHECKS_BY_DAY: { day: string; values: Record<CategoryId, number> }[] = [
  { day: "14 Aug", values: { "personal-care": 42, "food-alcoholic-drinks": 88, "construction-materials": 21, "automotive-parts": 19 } },
  { day: "15 Aug", values: { "personal-care": 51, "food-alcoholic-drinks": 92, "construction-materials": 18, "automotive-parts": 24 } },
  { day: "16 Aug", values: { "personal-care": 47, "food-alcoholic-drinks": 110, "construction-materials": 33, "automotive-parts": 28 } },
  { day: "17 Aug", values: { "personal-care": 63, "food-alcoholic-drinks": 97, "construction-materials": 29, "automotive-parts": 31 } },
  { day: "18 Aug", values: { "personal-care": 58, "food-alcoholic-drinks": 121, "construction-materials": 40, "automotive-parts": 22 } },
  { day: "19 Aug", values: { "personal-care": 71, "food-alcoholic-drinks": 134, "construction-materials": 26, "automotive-parts": 35 } },
  { day: "20 Aug", values: { "personal-care": 66, "food-alcoholic-drinks": 128, "construction-materials": 31, "automotive-parts": 29 } },
  { day: "21 Aug", values: { "personal-care": 80, "food-alcoholic-drinks": 141, "construction-materials": 44, "automotive-parts": 38 } },
  { day: "22 Aug", values: { "personal-care": 74, "food-alcoholic-drinks": 119, "construction-materials": 37, "automotive-parts": 41 } },
  { day: "23 Aug", values: { "personal-care": 69, "food-alcoholic-drinks": 152, "construction-materials": 28, "automotive-parts": 33 } },
  { day: "24 Aug", values: { "personal-care": 88, "food-alcoholic-drinks": 160, "construction-materials": 49, "automotive-parts": 47 } },
  { day: "25 Aug", values: { "personal-care": 91, "food-alcoholic-drinks": 148, "construction-materials": 52, "automotive-parts": 39 } },
  { day: "26 Aug", values: { "personal-care": 77, "food-alcoholic-drinks": 171, "construction-materials": 45, "automotive-parts": 51 } },
  { day: "27 Aug", values: { "personal-care": 95, "food-alcoholic-drinks": 184, "construction-materials": 58, "automotive-parts": 54 } },
];

export const ADMIN_CHECKS_BY_DAY = CHECKS_BY_DAY.map((row) => ({
  day: row.day,
  values: {
    "personal-care": row.values["personal-care"] * 3,
    "food-alcoholic-drinks": row.values["food-alcoholic-drinks"] * 4,
    "construction-materials": row.values["construction-materials"] * 2,
    "automotive-parts": row.values["automotive-parts"] * 2,
  } as Record<CategoryId, number>,
}));

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  "personal-care": "hsl(25 48% 48%)",
  "food-alcoholic-drinks": "hsl(35 52% 42%)",
  "construction-materials": "hsl(18 28% 34%)",
  "automotive-parts": "hsl(12 42% 46%)",
};

export function categoryTotals(series: typeof CHECKS_BY_DAY) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>;
  for (const row of series) {
    for (const c of CATEGORIES) totals[c.id] += row.values[c.id];
  }
  return totals;
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
