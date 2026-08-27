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
const EXTRA_USERS_KEY = "vero.extra-users";
const LEGACY_SESSION = "kebs.session";

type StoredUser = {
  email: string;
  password: string;
  name: string;
  role: Role;
  companyName?: string;
  companyStatus?: CompanyStatus;
};

const SEED_USERS: StoredUser[] = [
  {
    email: "manufacturer@vero.demo",
    password: "demo1234",
    name: "Amina Otieno",
    role: "manufacturer",
    companyName: "Atlas Goods KE",
    companyStatus: "approved",
  },
  {
    email: "manufacturer@kebs.demo",
    password: "demo1234",
    name: "Amina Otieno",
    role: "manufacturer",
    companyName: "Atlas Goods KE",
    companyStatus: "approved",
  },
  {
    email: "admin@vero.demo",
    password: "demo1234",
    name: "Vero Admin",
    role: "admin",
  },
  {
    email: "admin@kebs.demo",
    password: "demo1234",
    name: "Vero Admin",
    role: "admin",
  },
];

function readExtraUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(EXTRA_USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function allUsers(): StoredUser[] {
  return [...SEED_USERS, ...readExtraUsers()];
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("vero-auth"));
}

export function homeFor(session: Session) {
  return session.role === "admin" ? "/admin" : "/app";
}

export function login(email: string, password: string): { ok: true; session: Session } | { ok: false; message: string } {
  const user = allUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    return { ok: false, message: "Email or password is wrong." };
  }
  const session: Session = {
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
  };
  setSession(session);
  return { ok: true, session };
}

export function logout() {
  setSession(null);
}

export function registerManufacturer(input: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}): { ok: true; session: Session } | { ok: false; message: string } {
  const email = input.email.trim().toLowerCase();
  if (allUsers().some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, message: "That email is already registered." };
  }
  const user: StoredUser = {
    email,
    password: input.password,
    name: input.name.trim(),
    role: "manufacturer",
    companyName: input.companyName.trim(),
    companyStatus: "pending",
  };
  localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify([...readExtraUsers(), user]));
  const session: Session = {
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
  };
  setSession(session);
  return { ok: true, session };
}
