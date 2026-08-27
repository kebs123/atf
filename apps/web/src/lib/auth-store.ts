export type Role = "manufacturer" | "admin";
export type CompanyStatus = "pending" | "approved" | "suspended";

export type Session = {
  email: string;
  name: string;
  role: Role;
  companyName?: string;
  companyStatus?: CompanyStatus;
};

const SESSION_KEY = "vero.session";
const TOKEN_KEY = "vero.token";
const LEGACY_SESSION = "kebs.session";
const USERS_KEY = "vero.local-users";

type LocalUser = {
  email: string;
  password: string;
  name: string;
  role: Role;
  companyName?: string;
  companyStatus?: CompanyStatus;
};

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isLocalToken(token: string | null): boolean {
  return Boolean(token?.startsWith("local."));
}

function readLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalUser[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalManufacturer(input: {
  email: string;
  password: string;
  name: string;
  companyName: string;
}): Session {
  const email = input.email.trim().toLowerCase();
  const users = readLocalUsers().filter((u) => u.email !== email);
  const user: LocalUser = {
    email,
    password: input.password,
    name: input.name.trim(),
    role: "manufacturer",
    companyName: input.companyName.trim(),
    companyStatus: "approved",
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
  };
}

export function localLogin(email: string, password: string): Session | null {
  const user = readLocalUsers().find((u) => u.email === email.trim().toLowerCase() && u.password === password);
  if (!user) return null;
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    companyStatus: user.companyStatus ?? "approved",
  };
}

export function getSession(): Session | null {
  try {
    if (!getToken()) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION);
      return null;
    }
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setAuth(token: string | null, session: Session | null) {
  try {
    if (!token || !session) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.removeItem(LEGACY_SESSION);
    }
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new Event("vero-auth"));
}

export function clearAuth() {
  setAuth(null, null);
}

export function homeFor(session: Session) {
  return session.role === "admin" ? "/admin" : "/app";
}
