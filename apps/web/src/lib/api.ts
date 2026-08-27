import { apiRoot } from "@/lib/config";
import { asCategory, asResult, emptyCategoryValues, type ResultCode } from "@/lib/results";
import { hasCoords, type GeoCheck, type GeoPoint, type Shipment, type ShipmentStatus } from "@/lib/trace";
import type { CategoryId } from "@/lib/categories";
import { clearAuth, getToken, isLocalToken, type CompanyStatus, type Role, type Session } from "@/lib/auth-store";
import {
  backupAlerts,
  backupCodesCsv,
  backupCompanies,
  backupCreateBatch,
  backupCreateProduct,
  backupFlags,
  backupGenerateCodes,
  backupGetBatch,
  backupGetProduct,
  backupGetShipment,
  backupListProducts,
  backupPatchReport,
  backupRecallBatch,
  backupReports,
  backupSetCompanyStatus,
  backupShipments,
  backupStats,
  backupSubmitReport,
  backupVerifications,
  backupVerify,
} from "@/lib/backup";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function userMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please log in again.";
    if (err.status === 403) return "You cannot do this.";
    if (err.status === 404) return "Not found.";
    if (err.status === 429) return "Too many checks. Wait a minute.";
    if (err.status === 530 || err.status === 502 || err.status === 503) {
      return "Cannot reach Vero right now. Try SMS if you have signal.";
    }
    if (err.status >= 500) return "Vero is having a problem. Try again or SMS.";
    return err.message || "Something went wrong.";
  }
  return "Cannot reach Vero. Try SMS if you have signal.";
}

async function liveOrBackup<T>(_live: () => Promise<T>, backup: () => T): Promise<T> {
  return backup();
}

function unwrap(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  if (o.data !== undefined && typeof o.data === "object") return o.data;
  return data;
}

function rec(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function asList(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const o = rec(v);
  for (const key of ["items", "results", "rows", "products", "batches", "companies", "verifications", "alerts", "reports", "flags", "shipments", "checks"]) {
    if (Array.isArray(o[key])) return o[key] as unknown[];
  }
  return [];
}

function str(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && String(v).length) return String(v);
  }
  return "";
}

function num(o: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function nested(o: Record<string, unknown>, key: string): Record<string, unknown> {
  return rec(o[key]);
}

function idOf(o: Record<string, unknown>): string {
  return str(o, "id", "_id", "uuid") || String(num(o, "id") || "");
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { auth?: boolean; accept?: string } = {},
): Promise<T> {
  const { auth = true, accept, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", accept ?? "application/json");
  if (rest.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getToken();
    if (token && !isLocalToken(token)) headers.set("Authorization", `Bearer ${token}`);
  }
  let res: Response;
  try {
    res = await fetch(`${apiRoot()}${path}`, { ...rest, headers });
  } catch {
    throw new ApiError(0, "Cannot reach Vero. Try SMS if you have signal.");
  }
  if (res.status === 401 && auth && !path.startsWith("/api/auth/") && !isLocalToken(getToken())) {
    clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
  }
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  if (!res.ok) {
    if (text.trimStart().startsWith("<")) {
      throw new ApiError(res.status >= 500 ? res.status : 502, "Vero is having a problem. Try again or SMS.");
    }
    const o = rec(json);
    const msg =
      str(o, "error", "message", "detail") ||
      (res.status === 404 ? "Not found." : `Request failed (${res.status})`);
    throw new ApiError(res.status, msg);
  }
  return json as T;
}

export async function apiFetchOptional<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T | null> {
  try {
    return await apiFetch<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 501)) return null;
    throw err;
  }
}

export type VerifyOutcome = {
  code: string;
  result: ResultCode;
  productName: string;
  manufacturer: string;
  batch: string;
  expiry: string;
  firstVerifiedAt: string;
  message: string;
};

export async function verifyCode(code: string): Promise<VerifyOutcome> {
  try {
    const json = await apiFetch<unknown>("/api/verify", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ code }),
    });
    const root = rec(json);
    const inner = rec(unwrap(json));
    const o = Object.keys(inner).length ? inner : root;
    const product = nested(o, "product");
    const company = nested(o, "company");
    const manufacturer = nested(o, "manufacturer");
    const batch = nested(o, "batch");
    const resultRaw = o.result ?? o.status ?? o.outcome ?? root.result;
    return {
      code: str(o, "code", "verification_code") || code.toUpperCase(),
      result: asResult(typeof resultRaw === "object" ? rec(resultRaw).code ?? rec(resultRaw).status : resultRaw),
      productName: str(o, "productName", "product_name", "name") || str(product, "name", "title") || "—",
      manufacturer:
        str(o, "manufacturer", "manufacturerName", "company", "company_name") ||
        str(manufacturer, "name") ||
        str(company, "name") ||
        "—",
      batch: str(o, "batchNumber", "batch", "lot", "batch_code") || str(batch, "lot", "code", "name") || "—",
      expiry: str(o, "expiresAt", "expiry", "expires_at", "expiry_date") || str(batch, "expires_at", "expiry") || "",
      firstVerifiedAt: str(o, "firstVerifiedAt", "first_verified_at", "first_check_at", "checked_at") || "",
      message: str(o, "message"),
    };
  } catch {
    return backupVerify(code);
  }
}

export type ReportStatus = "open" | "reviewing" | "closed";

export type CounterfeitReport = {
  id: string;
  code: string;
  note: string;
  place: string;
  contact: string;
  at: string;
  status: ReportStatus;
  company: string;
  channel: string;
};

function asStatus(raw: unknown): ReportStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "reviewing" || s === "closed") return s;
  return "open";
}

function asReport(row: unknown): CounterfeitReport {
  const o = rec(row);
  return {
    id: idOf(o) || str(o, "code") + str(o, "created_at"),
    code: str(o, "code", "code_submitted", "verification_code"),
    note: str(o, "note", "message", "body"),
    place: str(o, "place", "location"),
    contact: str(o, "contact", "email", "phone"),
    at: str(o, "at", "created_at", "createdAt") || "—",
    status: asStatus(o.status),
    company: str(o, "company", "company_name") || str(nested(o, "company"), "name") || "—",
    channel: str(o, "channel") || "web",
  };
}

export async function submitReport(input: { code: string; note: string; place: string; contact: string }) {
  return liveOrBackup(async () => {
    const json = await apiFetch("/api/reports", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        code: input.code,
        note: input.note,
        place: input.place,
        contact: input.contact,
        channel: "web",
      }),
    });
    return asReport(unwrap(json) ?? json);
  }, () => backupSubmitReport(input));
}

export type AuthPayload = { token: string; session: Session };

function asRole(raw: unknown): Role {
  return String(raw ?? "").toLowerCase() === "admin" ? "admin" : "manufacturer";
}

function asCompanyStatus(raw: unknown): CompanyStatus | undefined {
  const s = String(raw ?? "").toLowerCase();
  if (s === "pending" || s === "approved" || s === "suspended") return s;
  return undefined;
}

function parseAuth(json: unknown): AuthPayload {
  const root = rec(json);
  const data = rec(unwrap(json));
  const o = Object.keys(data).length ? data : root;
  const user = nested(o, "user") || nested(o, "account") || nested(o, "session");
  const company = nested(o, "company") || nested(user, "company");
  const token =
    str(o, "token", "accessToken", "access_token", "jwt") ||
    str(root, "token", "accessToken", "access_token") ||
    str(nested(o, "tokens"), "access", "accessToken");
  if (!token) throw new ApiError(500, "Login did not return a token.");
  const role = asRole(user.role ?? o.role);
  const session: Session = {
    email: str(user, "email") || str(o, "email"),
    name: str(user, "name", "full_name", "fullName") || str(o, "name") || str(user, "email"),
    role,
    companyName: str(o, "companyName", "company_name") || str(company, "name") || str(user, "companyName") || undefined,
    companyStatus: asCompanyStatus(o.companyStatus ?? o.company_status ?? company.status ?? user.companyStatus),
  };
  return { token, session };
}

const AUTH_TIMEOUT_MS = 3000;

export async function loginRequest(email: string, password: string): Promise<AuthPayload> {
  return parseAuth(
    await apiFetch("/api/auth/login", {
      method: "POST",
      auth: false,
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function registerRequest(input: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}): Promise<AuthPayload> {
  return parseAuth(
    await apiFetch("/api/auth/register", {
      method: "POST",
      auth: false,
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        name: input.name,
        companyName: input.companyName,
        company_name: input.companyName,
      }),
    }),
  );
}

export async function logoutRequest() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* token may already be invalid */
  }
}

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: CategoryId;
  batches: number;
  codes: number;
  status: string;
};

export type BatchRow = {
  id: string;
  productId: string;
  lot: string;
  size: number;
  checks: number;
  expiry: string;
  status: string;
};

function asProduct(row: unknown): ProductRow {
  const o = rec(row);
  const batches = o.batches;
  const batchCount = Array.isArray(batches) ? batches.length : num(o, "batches", "batch_count", "batchesCount");
  return {
    id: idOf(o),
    name: str(o, "name", "title"),
    sku: str(o, "sku", "code"),
    category: asCategory(o.category ?? o.category_id),
    batches: batchCount,
    codes: num(o, "codes", "codesIssued", "codes_issued", "units", "quantity"),
    status: str(o, "status") || "Active",
  };
}

function asBatch(row: unknown, productId = ""): BatchRow {
  const o = rec(row);
  return {
    id: idOf(o),
    productId: str(o, "product_id", "productId") || productId,
    lot: str(o, "lot", "code", "batch_code", "name") || idOf(o),
    size: num(o, "quantity", "size", "units"),
    checks: num(o, "checks", "verify_count", "verifications"),
    expiry: str(o, "expires_at", "expiry", "expiry_date"),
    status: str(o, "status") || "Active",
  };
}

export async function listProducts(): Promise<ProductRow[]> {
  return liveOrBackup(async () => {
    const json = await apiFetch("/api/products");
    return asList(unwrap(json) ?? json).map(asProduct);
  }, backupListProducts);
}

export async function createProduct(input: { name: string; sku: string; category: CategoryId }) {
  return liveOrBackup(async () => {
    const json = await apiFetch("/api/products", { method: "POST", body: JSON.stringify(input) });
    return asProduct(unwrap(json) ?? json);
  }, () => backupCreateProduct(input));
}

export async function getProduct(id: string): Promise<{ product: ProductRow; batches: BatchRow[] }> {
  return liveOrBackup(
    async () => {
      const json = await apiFetch(`/api/products/${id}`);
      const data = unwrap(json) ?? json;
      const o = rec(data);
      const product = asProduct(Object.keys(nested(o, "product")).length ? o.product : data);
      let batches = asList(o.batches).map((b) => asBatch(b, id));
      if (!batches.length) {
        const alt = await apiFetchOptional(`/api/products/${id}/batches`);
        if (alt) batches = asList(unwrap(alt) ?? alt).map((b) => asBatch(b, id));
      }
      return { product, batches };
    },
    () => {
      const found = backupGetProduct(id);
      if (!found) throw new ApiError(404, "Not found.");
      return found;
    },
  );
}

export async function createBatch(input: { productId: string; lot: string; quantity: number; expiresAt: string }) {
  return liveOrBackup(async () => {
    const json = await apiFetch("/api/batches", {
      method: "POST",
      body: JSON.stringify({
        product_id: input.productId,
        productId: input.productId,
        lot: input.lot,
        quantity: input.quantity,
        expires_at: input.expiresAt,
      }),
    });
    return asBatch(unwrap(json) ?? json, input.productId);
  }, () => backupCreateBatch(input));
}

export async function getBatch(id: string): Promise<BatchRow> {
  return liveOrBackup(
    async () => {
      const json = await apiFetch(`/api/batches/${id}`);
      const data = unwrap(json) ?? json;
      const o = rec(data);
      return asBatch(Object.keys(nested(o, "batch")).length ? o.batch : data);
    },
    () => {
      const found = backupGetBatch(id);
      if (!found) throw new ApiError(404, "Not found.");
      return found;
    },
  );
}

export async function generateCodes(batchId: string) {
  return liveOrBackup(
    () => apiFetch(`/api/batches/${batchId}/codes`, { method: "POST", body: JSON.stringify({}) }),
    () => backupGenerateCodes(batchId),
  );
}

export async function recallBatch(batchId: string) {
  return liveOrBackup(
    () => apiFetch(`/api/batches/${batchId}/recall`, { method: "POST", body: JSON.stringify({}) }),
    () => backupRecallBatch(batchId),
  );
}

function downloadBlob(filename: string, contents: Blob | string) {
  const blob = typeof contents === "string" ? new Blob([contents], { type: "text/csv" }) : contents;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCodesCsv(batchId: string) {
  return liveOrBackup(
    async () => {
      const res = await fetch(`${apiRoot()}/api/batches/${batchId}/codes.csv`, {
        headers: {
          Authorization: getToken() ? `Bearer ${getToken()}` : "",
          Accept: "text/csv",
        },
      });
      if (!res.ok) throw new ApiError(res.status, "Could not export CSV.");
      downloadBlob(`batch-${batchId}-codes.csv`, await res.blob());
    },
    () => {
      downloadBlob(`batch-${batchId}-codes.csv`, backupCodesCsv(batchId));
    },
  );
}

export type StatsOverview = {
  products: number;
  activeBatches: number;
  codesIssued: number;
  checksThisWeek: number;
  openAlerts: number;
  openReports: number;
  pendingCompanies: number;
  approvedCompanies: number;
  flagsOpen: number;
  checksToday: number;
  series: { day: string; values: Record<CategoryId, number> }[];
};

function asSeries(raw: unknown): { day: string; values: Record<CategoryId, number> }[] {
  const list = asList(raw);
  return list.map((row) => {
    const o = rec(row);
    const values = emptyCategoryValues();
    const nestedValues = rec(o.values);
    for (const key of Object.keys(values) as CategoryId[]) {
      values[key] = num(o, key) || num(nestedValues, key);
    }
    return { day: str(o, "day", "date", "label") || "—", values };
  });
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return liveOrBackup(async () => {
    const json = (await apiFetchOptional("/api/stats/overview")) ?? {};
    const o = rec(unwrap(json) ?? json);
    return {
      products: num(o, "products", "product_count"),
      activeBatches: num(o, "activeBatches", "active_batches", "batches"),
      codesIssued: num(o, "codesIssued", "codes_issued", "units"),
      checksThisWeek: num(o, "checksThisWeek", "checks_this_week", "checks"),
      openAlerts: num(o, "openAlerts", "open_alerts", "alerts"),
      openReports: num(o, "openReports", "open_reports", "reports"),
      pendingCompanies: num(o, "pendingCompanies", "pending_companies"),
      approvedCompanies: num(o, "approvedCompanies", "approved_companies"),
      flagsOpen: num(o, "flagsOpen", "flags_open", "flags"),
      checksToday: num(o, "checksToday", "checks_today"),
      series: asSeries(o.checks_by_day ?? o.checksByDay ?? o.series ?? o.by_category),
    };
  }, backupStats);
}

export type VerificationRow = {
  id: string;
  code: string;
  product: string;
  category: CategoryId;
  result: ResultCode;
  channel: "sms" | "web";
  company: string;
  at: string;
  lng?: number;
  lat?: number;
  place: string;
  inTerritory: boolean;
  shipmentId: string | null;
};

function parseLngLat(o: Record<string, unknown>): { lng?: number; lat?: number } {
  const loc = nested(o, "location") || nested(o, "geo") || nested(o, "coords");
  const lng = num(o, "lng", "lon", "longitude") || num(loc, "lng", "lon", "longitude");
  const lat = num(o, "lat", "latitude") || num(loc, "lat", "latitude");
  return hasCoords(lng, lat) ? { lng, lat } : {};
}

function asVerification(row: unknown): VerificationRow {
  const o = rec(row);
  const { lng, lat } = parseLngLat(o);
  const channel = str(o, "channel").toLowerCase() === "sms" ? "sms" : "web";
  const inTerritoryRaw = o.inTerritory ?? o.in_territory;
  return {
    id: idOf(o) || str(o, "code") + str(o, "created_at"),
    code: str(o, "code", "verification_code"),
    product: str(o, "product", "product_name") || str(nested(o, "product"), "name") || "—",
    category: asCategory(o.category),
    result: asResult(o.result ?? o.status),
    channel,
    company: str(o, "company", "company_name") || str(nested(o, "company"), "name") || "—",
    at: str(o, "at", "created_at", "checked_at") || "—",
    lng,
    lat,
    place: str(o, "place", "location_name", "city") || str(nested(o, "location"), "name") || "—",
    inTerritory: typeof inTerritoryRaw === "boolean" ? inTerritoryRaw : true,
    shipmentId: str(o, "shipment_id", "shipmentId") || null,
  };
}

export async function listVerifications(limit = 50): Promise<VerificationRow[]> {
  return liveOrBackup(async () => {
    const json = await apiFetch(`/api/verifications?limit=${limit}`);
    return asList(unwrap(json) ?? json).map(asVerification);
  }, () => backupVerifications(limit));
}

export async function listAdminVerifications(q = ""): Promise<VerificationRow[]> {
  return liveOrBackup(async () => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    const json =
      (await apiFetchOptional(`/api/admin/verifications${qs}`)) ??
      (await apiFetchOptional(`/api/verifications${qs}`)) ??
      [];
    return asList(unwrap(json) ?? json).map(asVerification);
  }, () => backupVerifications(50, q));
}

export type AlertRow = {
  code: string;
  product: string;
  category: CategoryId;
  reason: string;
  severity: string;
  at: string;
};

function asAlert(row: unknown): AlertRow {
  const o = rec(row);
  return {
    code: str(o, "code", "verification_code"),
    product: str(o, "product", "product_name") || "—",
    category: asCategory(o.category),
    reason: str(o, "reason", "message") || str(o, "result"),
    severity: str(o, "severity", "level") || "hot",
    at: str(o, "at", "created_at") || "—",
  };
}

export async function listAlerts(): Promise<AlertRow[]> {
  return liveOrBackup(async () => {
    const json = (await apiFetchOptional("/api/alerts")) ?? [];
    return asList(unwrap(json) ?? json).map(asAlert);
  }, backupAlerts);
}

export type CompanyRow = {
  id: string;
  name: string;
  email: string;
  category: CategoryId;
  status: CompanyStatus;
  applied: string;
};

function asCompany(row: unknown): CompanyRow {
  const o = rec(row);
  return {
    id: idOf(o),
    name: str(o, "name", "company_name"),
    email: str(o, "email") || str(nested(o, "user"), "email"),
    category: asCategory(o.category),
    status: asCompanyStatus(o.status) ?? "pending",
    applied: str(o, "applied", "created_at", "applied_at") || "—",
  };
}

export async function listCompanies(): Promise<CompanyRow[]> {
  return liveOrBackup(async () => {
    const json = await apiFetch("/api/admin/companies");
    return asList(unwrap(json) ?? json).map(asCompany);
  }, backupCompanies);
}

export async function approveCompany(id: string) {
  return liveOrBackup(
    () => apiFetch(`/api/admin/companies/${id}/approve`, { method: "POST", body: JSON.stringify({}) }),
    () => backupSetCompanyStatus(id, "approved"),
  );
}

export async function suspendCompany(id: string) {
  return liveOrBackup(
    () => apiFetch(`/api/admin/companies/${id}/suspend`, { method: "POST", body: JSON.stringify({}) }),
    () => backupSetCompanyStatus(id, "suspended"),
  );
}

export type FlagRow = {
  code: string;
  company: string;
  category: CategoryId;
  result: ResultCode;
  checks: number;
  at: string;
};

function asFlag(row: unknown): FlagRow {
  const o = rec(row);
  return {
    code: str(o, "code"),
    company: str(o, "company", "company_name") || "—",
    category: asCategory(o.category),
    result: asResult(o.result ?? o.status),
    checks: num(o, "checks", "verify_count"),
    at: str(o, "at", "created_at") || "—",
  };
}

export async function listFlags(): Promise<FlagRow[]> {
  return liveOrBackup(async () => {
    const json = (await apiFetchOptional("/api/admin/flags")) ?? (await apiFetchOptional("/api/alerts")) ?? [];
    return asList(unwrap(json) ?? json).map(asFlag);
  }, backupFlags);
}

export async function listReports(scope?: "admin" | "company"): Promise<CounterfeitReport[]> {
  return liveOrBackup(async () => {
    const path = scope === "admin" ? "/api/admin/reports" : "/api/reports";
    const json = (await apiFetchOptional(path)) ?? [];
    return asList(unwrap(json) ?? json).map(asReport);
  }, backupReports);
}

export async function patchReportStatus(id: string, status: ReportStatus) {
  return liveOrBackup(
    async () => {
      try {
        await apiFetch(`/api/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          await apiFetch(`/api/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
          return;
        }
        throw err;
      }
    },
    () => backupPatchReport(id, status),
  );
}

function asPoint(row: unknown, fallbackName = ""): GeoPoint | null {
  const o = rec(row);
  const { lng, lat } = parseLngLat(o);
  if (!hasCoords(lng, lat) || lng === undefined || lat === undefined) return null;
  return { lng, lat, name: str(o, "name", "label") || fallbackName };
}

function asShipment(row: unknown): Shipment | null {
  const o = rec(row);
  const origin = asPoint(o.origin ?? o.from, "Origin");
  const destination = asPoint(o.destination ?? o.to, str(o, "to", "destination_name") || "Destination");
  if (!origin || !destination) return null;
  const waypoints = asList(o.waypoints).map((w) => asPoint(w)).filter((p): p is GeoPoint => Boolean(p));
  const statusRaw = str(o, "status");
  const status: ShipmentStatus =
    statusRaw === "Packed" || statusRaw === "In transit" || statusRaw === "Received" ? statusRaw : "In transit";
  return {
    id: idOf(o),
    to: destination.name,
    units: num(o, "units", "quantity"),
    batch: str(o, "batch", "lot"),
    category: asCategory(o.category),
    status,
    at: str(o, "at", "created_at") || "—",
    origin,
    destination,
    waypoints,
    corridorKm: num(o, "corridorKm", "corridor_km"),
    timeline: asList(o.timeline).map((t) => {
      const x = rec(t);
      return { label: str(x, "label", "status"), at: str(x, "at", "created_at") };
    }),
  };
}

export async function listShipments(): Promise<Shipment[]> {
  return liveOrBackup(async () => {
    const json = (await apiFetchOptional("/api/shipments")) ?? (await apiFetchOptional("/api/custody")) ?? [];
    return asList(unwrap(json) ?? json).map(asShipment).filter((s): s is Shipment => Boolean(s));
  }, backupShipments);
}

export async function getShipment(id: string): Promise<Shipment | null> {
  return liveOrBackup(async () => {
    const json = await apiFetchOptional(`/api/shipments/${id}`);
    if (!json) return null;
    return asShipment(unwrap(json) ?? json);
  }, () => backupGetShipment(id));
}

export function verificationsToGeo(rows: VerificationRow[]): GeoCheck[] {
  return rows
    .filter((r) => hasCoords(r.lng, r.lat))
    .map((r) => ({
      id: r.id,
      code: r.code,
      product: r.product,
      category: r.category,
      result: r.result,
      channel: r.channel,
      at: r.at,
      lng: r.lng as number,
      lat: r.lat as number,
      place: r.place,
      shipmentId: r.shipmentId,
      inTerritory: r.inTerritory,
    }));
}
