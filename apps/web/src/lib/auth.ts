import { logoutRequest } from "@/lib/api";
import { resetSampleData } from "@/lib/backup";
import {
  clearAuth,
  isLocalToken,
  getToken,
  localLogin,
  localPreviewSession,
  saveLocalManufacturer,
  setAuth,
  type Role,
  type Session,
} from "@/lib/auth-store";

export type { CompanyStatus, Role, Session } from "@/lib/auth-store";
export { getSession, homeFor } from "@/lib/auth-store";

function openSampleSession(session: Session): Session {
  resetSampleData();
  setAuth(`local.${Date.now()}`, session);
  return session;
}

export function enterLocalDashboard(email = "", role: Role = "manufacturer"): Session {
  return openSampleSession(localPreviewSession(email, role));
}

export async function login(email: string, password: string): Promise<{ ok: true; session: Session } | { ok: false; message: string }> {
  const local = localLogin(email, password);
  if (local) {
    return { ok: true, session: openSampleSession(local) };
  }
  return { ok: true, session: enterLocalDashboard(email) };
}

export async function logout() {
  if (!isLocalToken(getToken())) {
    await logoutRequest();
  }
  clearAuth();
}

export async function registerManufacturer(input: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; session: Session } | { ok: false; message: string }> {
  return { ok: true, session: openSampleSession(saveLocalManufacturer(input)) };
}
