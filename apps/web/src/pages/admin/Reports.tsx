import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { ReportsInbox } from "@/components/dash/ReportsInbox";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV } from "@/lib/nav";

const AdminReports = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Consumer counterfeit reports across all companies.</p>
        <ReportsInbox scope="admin" showCompany />
      </div>
    </AppShell>
  );
};

export default AdminReports;
