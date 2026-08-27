import { Link, Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { listAlerts } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { MANUFACTURER_NAV } from "@/lib/nav";

const Alerts = () => {
  const session = useAuth();
  const { data, error, loading } = useLive(listAlerts);

  if (!session) return <Navigate to="/login" replace />;
  const rows = data ?? [];

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Hot codes, unknown packs, and units under review.</p>
        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        <div className="mt-8 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground">No alerts.</p>}
          {rows.map((a) => (
            <div key={a.code} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-mono text-sm">{a.code}</p>
                <p className="text-sm text-muted-foreground">{a.product} · {categoryLabel(a.category)} · {a.reason}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/app/shipments?focus=${encodeURIComponent(a.code)}&trace=1`}
                  className="text-[11px] uppercase tracking-wider text-primary"
                >
                  Open on Trace
                </Link>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.at}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Alerts;
