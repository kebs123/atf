import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { COMPANIES } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";
import { ADMIN_NAV } from "@/lib/nav";

const Companies = () => {
  const session = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState(COMPANIES);

  if (!session) return <Navigate to="/login" replace />;

  const setStatus = (id: string, status: "approved" | "suspended") => {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast({
      title: status === "approved" ? "Company approved" : "Company suspended",
      description: status === "approved" ? "They can generate codes." : "Code generation is stopped.",
    });
  };

  return (
    <AppShell session={session} items={ADMIN_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve before code generation. Suspend to stop it.</p>
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
