import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/lib/categories";
import { PRODUCTS, PRODUCT_BATCHES } from "@/lib/demo-data";
import { MANUFACTURER_NAV } from "@/lib/nav";

const Products = () => {
  const session = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<CategoryId>("personal-care");
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [rows, setRows] = useState(PRODUCTS);

  if (!session) return <Navigate to="/login" replace />;
  const canCreate = session.companyStatus === "approved";
  const visible = filter === "all" ? rows : rows.filter((p) => p.category === filter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      toast({ title: "You cannot do this.", description: "Wait for Vero to approve your company.", variant: "destructive" });
      return;
    }
    setRows((prev) => [{ id: `p${prev.length + 1}`, name, sku, category, batches: 0, codes: 0, status: "Active" }, ...prev]);
    setName("");
    setSku("");
    toast({ title: "Product saved", description: `${name} is listed under ${categoryLabel(category)}.` });
  };

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-light tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">SKUs for {session.companyName}, grouped by category.</p>

        <div className="flex flex-wrap gap-2 mt-6">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider border ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider border ${filter === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              {c.short}
            </button>
          ))}
        </div>

        <form onSubmit={handleCreate} className="mt-6 bg-card/80 border border-border rounded-2xl p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="pname" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">Name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shea body butter 200ml" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="CARE-200" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">Category</Label>
            <select
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            Create SKU
          </Button>
        </form>

        <div className="mt-6 bg-card/80 border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">SKU</th>
                <th className="px-4 py-3 font-normal">Batches</th>
                <th className="px-4 py-3 font-normal">Codes</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {PRODUCT_BATCHES[p.id] ? (
                      <Link to={`/app/products/${p.id}`} className="underline underline-offset-4">
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(p.category)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.batches}</td>
                  <td className="px-4 py-3">{p.codes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default Products;
