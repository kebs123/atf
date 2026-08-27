import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logout, type Session } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; end?: boolean };

export function AppShell({
  session,
  items,
  children,
}: {
  session: Session;
  items: Item[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const pending = session.role === "manufacturer" && session.companyStatus === "pending";

  return (
    <div className="min-h-screen dash-mesh flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-md">
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShieldCheck className="h-4 w-4" />
            </motion.span>
            <span className="text-sm tracking-wide">Vero</span>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "block rounded-full px-4 py-2.5 text-[11px] uppercase tracking-wider font-normal transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs font-medium truncate">{session.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{session.companyName || "Administrator"}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-[11px] uppercase tracking-wider font-normal rounded-full"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm">Vero</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] uppercase tracking-wider"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        {pending && (
          <div className="mx-4 mt-4 md:mx-8 md:mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            {session.companyName} is waiting for Vero approval. You can look around, but you cannot generate codes yet.
          </div>
        )}
        <nav className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 border-b border-border bg-card/80">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
