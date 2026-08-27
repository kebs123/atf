import { useEffect, useState } from "react";
import { getSession, type Session } from "@/lib/auth";

export function useAuth() {
  const [session, setSessionState] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    window.addEventListener("storage", sync);
    window.addEventListener("vero-auth", sync);
    window.addEventListener("kebs-auth", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("vero-auth", sync);
      window.removeEventListener("kebs-auth", sync);
    };
  }, []);

  return session;
}
