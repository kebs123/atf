import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { SHIPMENTS } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";
import { MANUFACTURER_NAV } from "@/lib/nav";

const Shipments = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Shipments</h1>
        <p className="text-sm text-muted-foreground mt-1">Custody handoffs (phase 1.5). Demo list only.</p>
        <div className="mt-8 bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Destination</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Batch</th>
                <th className="px-4 py-3 font-normal">Units</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">{s.to}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(s.category)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.batch}</td>
                  <td className="px-4 py-3">{s.units.toLocaleString()}</td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default Shipments;
