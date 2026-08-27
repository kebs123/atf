import { loginRequest, logoutRequest, userMessage, ApiError } from "@/lib/api";
import {
  clearAuth,
  isLocalToken,
  getToken,
  localLogin,
  saveLocalManufacturer,
  setAuth,
  type Session,
} from "@/lib/auth-store";

export type { CompanyStatus, Role, Session } from "@/lib/auth-store";
export { getSession, homeFor } from "@/lib/auth-store";

export async function login(email: string, password: string): Promise<{ ok: true; session: Session } | { ok: false; message: string }> {
  const local = localLogin(email, password);
  if (local) {
    setAuth(`local.${Date.now()}`, local);
    return { ok: true, session: local };
  }
  try {
    const { token, session } = await loginRequest(email, password);
    setAuth(token, session);
    return { ok: true, session };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, message: "Email or password is wrong." };
    }
    return { ok: false, message: userMessage(err) };
  }
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
