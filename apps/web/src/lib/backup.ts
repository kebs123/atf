import { isLocalToken, getToken, type CompanyStatus } from "@/lib/auth-store";
import type { CategoryId } from "@/lib/categories";
import type { Shipment } from "@/lib/trace";
import type {
  AlertRow,
  BatchRow,
  CompanyRow,
  CounterfeitReport,
  FlagRow,
  ProductRow,
  ReportStatus,
  StatsOverview,
  VerificationRow,
  VerifyOutcome,
} from "@/lib/api";

const ORIGIN_KEY = "vero.origin-down";
const STORE_KEY = "vero.backup.v1";

export function isOriginDown(): boolean {
  try {
    return sessionStorage.getItem(ORIGIN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOriginDown() {
  try {
    sessionStorage.setItem(ORIGIN_KEY, "1");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("vero-origin"));
}

export function markOriginUp() {
  try {
    sessionStorage.removeItem(ORIGIN_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("vero-origin"));
}

export function shouldSkipLive(): boolean {
  return isLocalToken(getToken()) || isOriginDown();
}

export function usingBackup(): boolean {
  return shouldSkipLive();
}

export async function probeOrigin(): Promise<boolean> {
  if (isOriginDown()) return false;
  try {
    const res = await fetch("/health", { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      markOriginUp();
      return true;
    }
    if (res.status === 530 || res.status >= 500) {
      markOriginDown();
      return false;
    }
    markOriginUp();
    return true;
  } catch {
    markOriginDown();
    return false;
  }
}

type Store = {
  products: ProductRow[];
  batches: BatchRow[];
  verifications: VerificationRow[];
  alerts: AlertRow[];
  reports: CounterfeitReport[];
  companies: CompanyRow[];
  flags: FlagRow[];
  shipments: Shipment[];
  series: StatsOverview["series"];
};

function seed(): Store {
  const products: ProductRow[] = [
    { id: "p1", name: "Shea body butter 200ml", sku: "CARE-200", category: "personal-care", batches: 2, codes: 4000, status: "Active" },
    { id: "p2", name: "Skin cream 50ml", sku: "CRM-50", category: "personal-care", batches: 1, codes: 2400, status: "Active" },
    { id: "p3", name: "Cooking oil 1L", sku: "OIL-1L", category: "food-alcoholic-drinks", batches: 2, codes: 6400, status: "Active" },
    { id: "p4", name: "Lager 500ml", sku: "LGR-500", category: "food-alcoholic-drinks", batches: 2, codes: 5000, status: "Active" },
    { id: "p5", name: "Cement 50kg", sku: "CEM-50", category: "construction-materials", batches: 2, codes: 3200, status: "Active" },
    { id: "p6", name: "Roofing sheet 3m", sku: "ROOF-3", category: "construction-materials", batches: 1, codes: 1200, status: "Active" },
    { id: "p7", name: "Brake pad set", sku: "BRK-PAD", category: "automotive-parts", batches: 1, codes: 1600, status: "Active" },
    { id: "p8", name: "Oil filter", sku: "OIL-FLT", category: "automotive-parts", batches: 1, codes: 800, status: "Active" },
  ];

  const batches: BatchRow[] = [
    { id: "c09", productId: "p1", lot: "C09", size: 2000, checks: 188, expiry: "2027-06-01", status: "Active" },
    { id: "c08", productId: "p1", lot: "C08", size: 2000, checks: 94, expiry: "2027-01-12", status: "Active" },
    { id: "s50", productId: "p2", lot: "S50", size: 2400, checks: 77, expiry: "2027-03-01", status: "Active" },
    { id: "f04", productId: "p3", lot: "F04", size: 3200, checks: 410, expiry: "2027-01-15", status: "Active" },
    { id: "f03", productId: "p3", lot: "F03", size: 3200, checks: 118, expiry: "2026-09-30", status: "Active" },
    { id: "l12", productId: "p4", lot: "L12", size: 2500, checks: 620, expiry: "2026-12-01", status: "Active" },
    { id: "l11", productId: "p4", lot: "L11", size: 2500, checks: 41, expiry: "2026-08-20", status: "Recalled" },
    { id: "b12", productId: "p5", lot: "B12", size: 1600, checks: 212, expiry: "2028-03-01", status: "Active" },
    { id: "b11", productId: "p5", lot: "B11", size: 1600, checks: 90, expiry: "2027-11-12", status: "Active" },
    { id: "r03", productId: "p6", lot: "R03", size: 1200, checks: 33, expiry: "2030-01-01", status: "Active" },
    { id: "a22", productId: "p7", lot: "A22", size: 1600, checks: 156, expiry: "2029-05-01", status: "Active" },
    { id: "a18", productId: "p8", lot: "A18", size: 800, checks: 44, expiry: "2028-08-01", status: "Active" },
  ];

  const verifications: VerificationRow[] = [
    { id: "v1", code: "SGSP792F", product: "Shea body butter 200ml", category: "personal-care", result: "genuine", channel: "sms", company: "Atlas Goods KE", at: "Today 09:14", lng: 36.8219, lat: -1.2921, place: "Nairobi", inTerritory: true, shipmentId: "s1" },
    { id: "v2", code: "H9C1L5W2", product: "Shea body butter 200ml", category: "personal-care", result: "genuine", channel: "sms", company: "Atlas Goods KE", at: "Today 08:51", lng: 36.8172, lat: -1.2864, place: "Nairobi CBD", inTerritory: true, shipmentId: "s1" },
    { id: "v3", code: "A3N8R2T6", product: "Cooking oil 1L", category: "food-alcoholic-drinks", result: "already_verified", channel: "web", company: "Atlas Goods KE", at: "Today 08:12", lng: 39.6682, lat: -4.0435, place: "Mombasa", inTerritory: true, shipmentId: "s2" },
    { id: "v4", code: "C7M2T0Q1", product: "Lager 500ml", category: "food-alcoholic-drinks", result: "genuine", channel: "sms", company: "Atlas Goods KE", at: "Yesterday 18:02", lng: 36.08, lat: -0.3, place: "Nakuru", inTerritory: true, shipmentId: "s2" },
    { id: "v5", code: "K4P9B1X8", product: "Cement 50kg", category: "construction-materials", result: "genuine", channel: "sms", company: "Savanna Cement", at: "Yesterday 16:40", lng: 34.7617, lat: -0.0917, place: "Kisumu", inTerritory: true, shipmentId: "s3" },
    { id: "v6", code: "FAKE0001", product: "—", category: "automotive-parts", result: "unknown", channel: "web", company: "—", at: "Yesterday 11:22", lng: 39.67, lat: -4.05, place: "Mombasa port", inTerritory: false, shipmentId: null },
    { id: "v7", code: "R1V8N3D5", product: "Brake pad set", category: "automotive-parts", result: "flagged", channel: "sms", company: "Highland Auto", at: "Yesterday 11:22", lng: 35.2698, lat: 0.5143, place: "Eldoret", inTerritory: true, shipmentId: "s4" },
    { id: "v8", code: "L11RECAL", product: "Lager 500ml", category: "food-alcoholic-drinks", result: "recalled", channel: "web", company: "Atlas Goods KE", at: "2 days ago", lng: 36.82, lat: -1.29, place: "Nairobi", inTerritory: true, shipmentId: "s2" },
  ];

  const alerts: AlertRow[] = [
    { code: "R1V8N3D5", product: "Brake pad set", category: "automotive-parts", reason: "verify_count 6", severity: "hot", at: "Yesterday 11:22" },
    { code: "FAKE0001", product: "Unknown", category: "automotive-parts", reason: "Not in system", severity: "unknown", at: "Yesterday 16:40" },
    { code: "L11RECAL", product: "Lager 500ml", category: "food-alcoholic-drinks", reason: "Batch recalled", severity: "flagged", at: "2 days ago" },
    { code: "C7M2T0Q1", product: "Lager 500ml", category: "food-alcoholic-drinks", reason: "verify_count 5", severity: "hot", at: "3 days ago" },
    { code: "K4P9B1X8", product: "Cement 50kg", category: "construction-materials", reason: "Unusual geography", severity: "flagged", at: "4 days ago" },
  ];

  const reports: CounterfeitReport[] = [
    { id: "r1", code: "FAKE0001", note: "Seal looked reused. Seller would not say where stock came from.", place: "Gikomba, Nairobi", contact: "", at: "Today 10:02", status: "open", company: "—", channel: "web" },
    { id: "r2", code: "R1V8N3D5", note: "Pack print is blurry compared to last month's delivery.", place: "Eldoret auto shop", contact: "07xx", at: "Yesterday 14:20", status: "reviewing", company: "Highland Auto", channel: "web" },
  ];

  const companies: CompanyRow[] = [
    { id: "c1", name: "Rift Valley Mills", email: "ops@rvm.ke", category: "food-alcoholic-drinks", status: "pending", applied: "26 Aug 2026" },
    { id: "c2", name: "Coastal Beauty Ltd", email: "hello@coastalbeauty.ke", category: "personal-care", status: "pending", applied: "25 Aug 2026" },
    { id: "c3", name: "Atlas Goods KE", email: "manufacturer@vero.demo", category: "personal-care", status: "approved", applied: "12 Jan 2026" },
    { id: "c4", name: "Savanna Cement", email: "qa@savannacement.ke", category: "construction-materials", status: "suspended", applied: "03 Mar 2026" },
    { id: "c5", name: "Highland Auto", email: "reg@highlandauto.ke", category: "automotive-parts", status: "pending", applied: "24 Aug 2026" },
  ];

  const flags: FlagRow[] = [
    { code: "R1V8N3D5", company: "Highland Auto", category: "automotive-parts", result: "flagged", checks: 6, at: "Yesterday 11:22" },
    { code: "FAKE0001", company: "—", category: "automotive-parts", result: "unknown", checks: 14, at: "Yesterday 16:40" },
    { code: "ZZ99XX11", company: "—", category: "food-alcoholic-drinks", result: "unknown", checks: 9, at: "Yesterday 07:03" },
    { code: "L11RECAL", company: "Atlas Goods KE", category: "food-alcoholic-drinks", result: "recalled", checks: 5, at: "2 days ago" },
  ];

  const shipments: Shipment[] = [
    {
      id: "s1",
      to: "Nairobi Central Depot",
      units: 2000,
      batch: "C09",
      category: "personal-care",
      status: "In transit",
      at: "27 Aug 2026",
      origin: { lng: 36.8219, lat: -1.2921, name: "Nairobi factory" },
      destination: { lng: 36.8919, lat: -1.2321, name: "Nairobi Central Depot" },
      waypoints: [{ lng: 36.85, lat: -1.26, name: "Thika Road" }],
      corridorKm: 18,
      timeline: [
        { label: "Packed", at: "26 Aug 2026" },
        { label: "In transit", at: "27 Aug 2026" },
      ],
    },
    {
      id: "s2",
      to: "Mombasa Retail Co-op",
      units: 800,
      batch: "F04",
      category: "food-alcoholic-drinks",
      status: "Received",
      at: "22 Aug 2026",
      origin: { lng: 36.8219, lat: -1.2921, name: "Nairobi factory" },
      destination: { lng: 39.6682, lat: -4.0435, name: "Mombasa Retail Co-op" },
      waypoints: [{ lng: 37.9, lat: -2.3, name: "Voi" }],
      corridorKm: 480,
      timeline: [
        { label: "Packed", at: "20 Aug 2026" },
        { label: "In transit", at: "21 Aug 2026" },
        { label: "Received", at: "22 Aug 2026" },
      ],
    },
    {
      id: "s3",
      to: "Kisumu Build Hub",
      units: 400,
      batch: "B12",
      category: "construction-materials",
      status: "Packed",
      at: "20 Aug 2026",
      origin: { lng: 36.8219, lat: -1.2921, name: "Nairobi factory" },
      destination: { lng: 34.7617, lat: -0.0917, name: "Kisumu Build Hub" },
      waypoints: [],
      corridorKm: 350,
      timeline: [{ label: "Packed", at: "20 Aug 2026" }],
    },
    {
      id: "s4",
      to: "Eldoret Auto Parts",
      units: 160,
      batch: "A22",
      category: "automotive-parts",
      status: "Received",
      at: "18 Aug 2026",
      origin: { lng: 36.8219, lat: -1.2921, name: "Nairobi factory" },
      destination: { lng: 35.2698, lat: 0.5143, name: "Eldoret Auto Parts" },
      waypoints: [{ lng: 36.08, lat: -0.3, name: "Nakuru" }],
      corridorKm: 310,
      timeline: [
        { label: "Packed", at: "16 Aug 2026" },
        { label: "Received", at: "18 Aug 2026" },
      ],
    },
  ];

  const series: StatsOverview["series"] = [
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

  return { products, batches, verifications, alerts, reports, companies, flags, shipments, series };
}

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* ignore */
  }
  const initial = seed();
  writeStore(initial);
  return initial;
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

function mutate(fn: (store: Store) => void): Store {
  const store = readStore();
  fn(store);
  writeStore(store);
  return store;
}

export function backupListProducts(): ProductRow[] {
  return readStore().products;
}

export function backupCreateProduct(input: { name: string; sku: string; category: CategoryId }): ProductRow {
  const product: ProductRow = {
    id: `p${Date.now()}`,
    name: input.name,
    sku: input.sku,
    category: input.category,
    batches: 0,
    codes: 0,
    status: "Active",
  };
  mutate((s) => s.products.unshift(product));
  return product;
}

export function backupGetProduct(id: string): { product: ProductRow; batches: BatchRow[] } | null {
  const store = readStore();
  const product = store.products.find((p) => p.id === id);
  if (!product) return null;
  return { product, batches: store.batches.filter((b) => b.productId === id) };
}

export function backupCreateBatch(input: { productId: string; lot: string; quantity: number; expiresAt: string }): BatchRow {
  const batch: BatchRow = {
    id: `b${Date.now()}`,
    productId: input.productId,
    lot: input.lot,
    size: input.quantity,
    checks: 0,
    expiry: input.expiresAt,
    status: "Active",
  };
  mutate((s) => {
    s.batches.unshift(batch);
    const product = s.products.find((p) => p.id === input.productId);
    if (product) {
      product.batches += 1;
      product.codes += input.quantity;
    }
  });
  return batch;
}

export function backupGetBatch(id: string): BatchRow | null {
  return readStore().batches.find((b) => b.id === id) ?? null;
}

export function backupGenerateCodes(batchId: string) {
  const batch = backupGetBatch(batchId);
  return { ok: true, batchId, codes: batch?.size ?? 0 };
}

export function backupRecallBatch(batchId: string) {
  mutate((s) => {
    const batch = s.batches.find((b) => b.id === batchId);
    if (batch) batch.status = "Recalled";
  });
  return { ok: true };
}

export function backupCodesCsv(batchId: string): string {
  const batch = backupGetBatch(batchId);
  const lot = batch?.lot || batchId;
  const size = Math.min(batch?.size || 20, 200);
  const lines = ["code,lot,status"];
  for (let i = 1; i <= size; i += 1) {
    lines.push(`${lot}-${String(i).padStart(4, "0")},${lot},${batch?.status || "Active"}`);
  }
  return lines.join("\n");
}

export function backupStats(): StatsOverview {
  const s = readStore();
  const openReports = s.reports.filter((r) => r.status === "open").length;
  return {
    products: s.products.length,
    activeBatches: s.batches.filter((b) => b.status !== "Recalled").length,
    codesIssued: s.products.reduce((n, p) => n + p.codes, 0),
    checksThisWeek: s.series.slice(-7).reduce((n, row) => n + Object.values(row.values).reduce((a, b) => a + b, 0), 0),
    openAlerts: s.alerts.length,
    openReports,
    pendingCompanies: s.companies.filter((c) => c.status === "pending").length,
    approvedCompanies: s.companies.filter((c) => c.status === "approved").length,
    flagsOpen: s.flags.length,
    checksToday: Object.values(s.series.at(-1)?.values ?? {}).reduce((a, b) => a + b, 0),
    series: s.series,
  };
}

export function backupVerifications(limit = 50, q = ""): VerificationRow[] {
  const needle = q.trim().toLowerCase();
  return readStore()
    .verifications.filter((row) => {
      if (!needle) return true;
      return `${row.code} ${row.product} ${row.company}`.toLowerCase().includes(needle);
    })
    .slice(0, limit);
}

export function backupAlerts(): AlertRow[] {
  return readStore().alerts;
}

export function backupCompanies(): CompanyRow[] {
  return readStore().companies;
}

export function backupSetCompanyStatus(id: string, status: CompanyStatus) {
  mutate((s) => {
    const row = s.companies.find((c) => c.id === id);
    if (row) row.status = status;
  });
  return { ok: true };
}

export function backupFlags(): FlagRow[] {
  return readStore().flags;
}

export function backupReports(): CounterfeitReport[] {
  return readStore().reports;
}

export function backupSubmitReport(input: { code: string; note: string; place: string; contact: string }): CounterfeitReport {
  const report: CounterfeitReport = {
    id: `r${Date.now()}`,
    code: input.code.toUpperCase(),
    note: input.note,
    place: input.place,
    contact: input.contact,
    at: "Just now",
    status: "open",
    company: "—",
    channel: "web",
  };
  mutate((s) => s.reports.unshift(report));
  return report;
}

export function backupPatchReport(id: string, status: ReportStatus) {
  mutate((s) => {
    const row = s.reports.find((r) => r.id === id);
    if (row) row.status = status;
  });
}

export function backupShipments(): Shipment[] {
  return readStore().shipments;
}

export function backupGetShipment(id: string): Shipment | null {
  return readStore().shipments.find((s) => s.id === id) ?? null;
}

const UNITS: Record<string, Omit<VerifyOutcome, "code">> = {
  SGSP792F: {
    result: "genuine",
    productName: "Shea body butter 200ml",
    manufacturer: "Atlas Goods KE",
    batch: "C09",
    expiry: "2027-06-01",
    firstVerifiedAt: "",
    message: "Shea body butter 200ml from Atlas Goods KE · batch C09 · exp 2027-06-01. First check. If the pack looks tampered, do not use.",
  },
  H9C1L5W2: {
    result: "genuine",
    productName: "Shea body butter 200ml",
    manufacturer: "Atlas Goods KE",
    batch: "C09",
    expiry: "2027-06-01",
    firstVerifiedAt: "",
    message: "",
  },
  A3N8R2T6: {
    result: "already_verified",
    productName: "Cooking oil 1L",
    manufacturer: "Atlas Goods KE",
    batch: "F04",
    expiry: "2027-01-15",
    firstVerifiedAt: "Today 07:40",
    message: "",
  },
  L11RECAL: {
    result: "recalled",
    productName: "Lager 500ml",
    manufacturer: "Atlas Goods KE",
    batch: "L11",
    expiry: "2026-08-20",
    firstVerifiedAt: "",
    message: "",
  },
  R1V8N3D5: {
    result: "flagged",
    productName: "Brake pad set",
    manufacturer: "Highland Auto",
    batch: "A22",
    expiry: "2029-05-01",
    firstVerifiedAt: "",
    message: "",
  },
};

export function backupVerify(code: string): VerifyOutcome {
  const normalized = code.trim().toUpperCase();
  const known = UNITS[normalized];
  if (known) return { code: normalized, ...known };
  return {
    code: normalized,
    result: "unknown",
    productName: "—",
    manufacturer: "—",
    batch: "—",
    expiry: "",
    firstVerifiedAt: "",
    message: "This code was not found in the local backup. When the live API is up, check again.",
  };
}
