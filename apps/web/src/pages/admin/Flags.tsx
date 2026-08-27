import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_FLAGS, resultClass, resultLabel } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";
import { ADMIN_NAV } from "@/lib/nav";

const Flags = () => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Flags</h1>
        <p className="text-sm text-muted-foreground mt-1">Unknown codes and high-repeat units across the system.</p>
        <div className="mt-8 bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Company</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Result</th>
                <th className="px-4 py-3 font-normal">Checks</th>
                <th className="px-4 py-3 font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_FLAGS.map((f) => (
                <tr key={f.code} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{f.code}</td>
                  <td className="px-4 py-3">{f.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(f.category)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${resultClass(f.result)}`}>
                      {resultLabel(f.result)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{f.checks}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default Flags;
