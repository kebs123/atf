import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { ReportsInbox } from "@/components/dash/ReportsInbox";
import { useAuth } from "@/hooks/use-auth";
import { MANUFACTURER_NAV } from "@/lib/nav";

const Reports = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Public “this feels fake” filings for your packs, plus unknown codes that may be impersonating the brand.
        </p>
        <ReportsInbox scope="company" showTrace />
      </div>
    </AppShell>
  );
};

export default Reports;
