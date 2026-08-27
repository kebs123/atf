import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { ALERTS } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";
import { MANUFACTURER_NAV } from "@/lib/nav";

const Alerts = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Hot codes, unknown packs, and units under review.</p>
        <div className="mt-8 space-y-3">
          {ALERTS.map((a) => (
            <div key={a.code} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-mono text-sm">{a.code}</p>
                <p className="text-sm text-muted-foreground">{a.product} · {categoryLabel(a.category)} · {a.reason}</p>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.at}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Alerts;
