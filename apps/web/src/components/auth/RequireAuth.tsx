import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { homeFor, type Role } from "@/lib/auth";

export function RequireAuth({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeFor(session)} replace />;
  return <>{children}</>;
}
