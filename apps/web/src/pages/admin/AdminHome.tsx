import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/dash/AppShell";
import { AnalyticsBoard } from "@/components/dash/AnalyticsBoard";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV } from "@/lib/nav";
import { ADMIN_CHECKS_BY_DAY, ADMIN_STATS } from "@/lib/demo-data";

const AdminHome = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  const cards = [
    { label: "Pending companies", value: ADMIN_STATS.pendingCompanies, href: "/admin/companies" },
    { label: "Approved companies", value: ADMIN_STATS.approvedCompanies, href: "/admin/companies" },
    { label: "Open flags", value: ADMIN_STATS.flagsOpen, href: "/admin/flags" },
    { label: "Checks today", value: ADMIN_STATS.checksToday.toLocaleString(), href: "/admin/verifications" },
  ];

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-6xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">System-wide</p>
        </div>
        <h1 className="text-3xl font-light tracking-tight">Vero admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve companies, watch flags, and watch checks by category.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          {cards.map((card, i) => (
            <Link key={card.label} to={card.href} className="block">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-soft h-full hover:shadow-hover transition-shadow"
              >
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-light mt-2 tabular-nums">{card.value}</p>
              </motion.div>
            </Link>
          ))}
        </div>
        <AnalyticsBoard series={ADMIN_CHECKS_BY_DAY} title="National checks by category" />
      </div>
    </AppShell>
  );
};

export default AdminHome;
