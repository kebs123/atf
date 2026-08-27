import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { listAdminVerifications } from "@/lib/api";
import { resultClass, resultLabel } from "@/lib/results";
import { ADMIN_NAV } from "@/lib/nav";

const Verifications = () => {
  const session = useAuth();
  const [q, setQ] = useState("");
  const { data, error, loading } = useLive(() => listAdminVerifications());
  const rows = useMemo(() => {
    const all = data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (v) =>
        v.code.toLowerCase().includes(needle) ||
        v.company.toLowerCase().includes(needle) ||
        v.result.includes(needle),
    );
  }, [data, q]);

  if (!session) return <Navigate to="/login" replace />;

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Verifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Searchable log from the live API.</p>
        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        <div className="mt-6 max-w-sm space-y-2">
          <Label htmlFor="q" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
            Search
          </Label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Code, company, or result" />
        </div>
        <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Result</th>
                <th className="px-4 py-3 font-normal">Channel</th>
                <th className="px-4 py-3 font-normal">Company</th>
                <th className="px-4 py-3 font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>No matching checks.</td>
                </tr>
              )}
              {rows.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{v.code}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${resultClass(v.result)}`}>
                      {resultLabel(v.result)}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase text-[11px] tracking-wider text-muted-foreground">{v.channel}</td>
                  <td className="px-4 py-3">{v.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default Verifications;
