import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { useToast } from "@/hooks/use-toast";
import { approveCompany, listCompanies, suspendCompany, userMessage } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { ADMIN_NAV } from "@/lib/nav";

const Companies = () => {
  const session = useAuth();
  const { toast } = useToast();
  const { data, error, loading, reload } = useLive(listCompanies);

  if (!session) return <Navigate to="/login" replace />;
  const rows = data ?? [];

  const setStatus = async (id: string, status: "approved" | "suspended") => {
    try {
      if (status === "approved") await approveCompany(id);
      else await suspendCompany(id);
      toast({
        title: status === "approved" ? "Company approved" : "Company suspended",
        description: status === "approved" ? "They can generate codes." : "Code generation is stopped.",
      });
      reload();
    } catch (err) {
      toast({ title: "Could not update company", description: userMessage(err), variant: "destructive" });
    }
  };

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve before code generation. Suspend to stop it.</p>
        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        <div className="mt-8 bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Company</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Applied</th>
                <th className="px-4 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>No companies.</td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(c.category)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 capitalize">{c.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.applied}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {c.status !== "approved" && (
                        <Button size="sm" className="rounded-full text-[11px] uppercase tracking-wider font-normal" onClick={() => setStatus(c.id, "approved")}>
                          Approve
                        </Button>
                      )}
                      {c.status !== "suspended" && (
                        <Button size="sm" variant="outline" className="rounded-full text-[11px] uppercase tracking-wider font-normal" onClick={() => setStatus(c.id, "suspended")}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default Companies;
