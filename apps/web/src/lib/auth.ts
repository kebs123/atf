import { loginRequest, logoutRequest, ApiError, isTunnelError } from "@/lib/api";
import { isOriginDown, probeOrigin } from "@/lib/backup";
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

export function enterLocalDashboard(email = "", role: Role = "manufacturer"): Session {
  const session = localPreviewSession(email, role);
  setAuth(`local.${Date.now()}`, session);
  return session;
}

export async function login(email: string, password: string): Promise<{ ok: true; session: Session } | { ok: false; message: string }> {
  const local = localLogin(email, password);
  if (local) {
    setAuth(`local.${Date.now()}`, local);
    return { ok: true, session: local };
  }

  const live = isOriginDown() ? false : await probeOrigin();
  if (live) {
    try {
      const { token, session } = await loginRequest(email, password);
      setAuth(token, session);
      return { ok: true, session };
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return { ok: false, message: "Email or password is wrong." };
      }
      if (!isTunnelError(err)) {
        return { ok: false, message: "Could not sign in." };
      }
    }
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
  const session = saveLocalManufacturer(input);
  setAuth(`local.${Date.now()}`, session);
  return { ok: true, session };
}
