import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/dash/AppShell";
import { AnalyticsBoard } from "@/components/dash/AnalyticsBoard";
import { useAuth } from "@/hooks/use-auth";
import { MANUFACTURER_NAV } from "@/lib/nav";
import { categoryLabel } from "@/lib/categories";
import { CHECKS_BY_DAY, MANUFACTURER_STATS, RECENT_VERIFICATIONS, resultClass, resultLabel } from "@/lib/demo-data";

const ManufacturerHome = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  const cards = [
    { label: "Products", value: MANUFACTURER_STATS.products, href: "/app/products" },
    { label: "Active batches", value: MANUFACTURER_STATS.activeBatches, href: "/app/products" },
    { label: "Codes issued", value: MANUFACTURER_STATS.codesIssued.toLocaleString() },
    { label: "Checks this week", value: MANUFACTURER_STATS.checksThisWeek.toLocaleString() },
    { label: "Open alerts", value: MANUFACTURER_STATS.openAlerts, href: "/app/alerts" },
  ];

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

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
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

        <AnalyticsBoard series={CHECKS_BY_DAY} title="Checks by category" />

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
              {RECENT_VERIFICATIONS.map((row) => (
                <tr key={row.code} className="border-t border-border">
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
