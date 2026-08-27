import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/dash/AppShell";
import { AnalyticsBoard } from "@/components/dash/AnalyticsBoard";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { MANUFACTURER_NAV } from "@/lib/nav";
import { categoryLabel } from "@/lib/categories";
import { getStatsOverview, listVerifications } from "@/lib/api";
import { resultClass, resultLabel } from "@/lib/results";

const ManufacturerHome = () => {
  const session = useAuth();
  const stats = useLive(getStatsOverview);
  const recent = useLive(() => listVerifications(20));

  if (!session) return <Navigate to="/login" replace />;

  const overview = stats.data;
  const cards = [
    { label: "Products", value: overview?.products ?? "—", href: "/app/products" },
    { label: "Active batches", value: overview?.activeBatches ?? "—", href: "/app/products" },
    { label: "Codes issued", value: overview ? overview.codesIssued.toLocaleString() : "—" },
    { label: "Checks this week", value: overview ? overview.checksThisWeek.toLocaleString() : "—" },
    { label: "Open alerts", value: overview?.openAlerts ?? "—", href: "/app/alerts" },
    { label: "Open reports", value: overview?.openReports ?? "—", href: "/app/reports" },
  ];
  const rows = recent.data ?? [];

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-6xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Live for this company</p>
        </div>
        <h1 className="text-3xl font-light tracking-tight">{session.companyName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Category mix, checks, and alerts — scoped to you.</p>
        {(stats.error || recent.error) && (
          <p className="text-sm text-destructive mt-4">{stats.error || recent.error}</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {cards.map((card, i) => {
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-soft h-full hover:shadow-hover transition-shadow"
              >
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-light mt-2 tabular-nums">{card.value}</p>
              </motion.div>
            );
            return card.href ? (
              <Link key={card.label} to={card.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={card.label}>{inner}</div>
            );
          })}
        </div>

        {overview?.series?.length ? <AnalyticsBoard series={overview.series} title="Checks by category" /> : null}

        <h2 className="text-sm font-medium mt-10 mb-3">Recent verifications</h2>
        <div className="bg-card/80 border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Result</th>
                <th className="px-4 py-3 font-normal">Channel</th>
                <th className="px-4 py-3 font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {recent.loading && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              )}
              {!recent.loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    No checks yet.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                  <td className="px-4 py-3">{row.product}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(row.category)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${resultClass(row.result)}`}>
                      {resultLabel(row.result)}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase text-[11px] tracking-wider text-muted-foreground">{row.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default ManufacturerHome;
