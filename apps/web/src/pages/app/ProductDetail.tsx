import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { useToast } from "@/hooks/use-toast";
import { createBatch, getProduct, userMessage } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { MANUFACTURER_NAV } from "@/lib/nav";

const ProductDetail = () => {
  const { id } = useParams();
  const session = useAuth();
  const { toast } = useToast();
  const { data, error, loading, reload } = useLive(() => getProduct(id ?? ""), [id]);
  const [lot, setLot] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  if (!session) return <Navigate to="/login" replace />;
  if (!id) return <Navigate to="/app/products" replace />;

  if (loading) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p>{error || "Not found."}</p>
        <Link to="/app/products" className="text-sm underline">
          Back to products
        </Link>
      </AppShell>
    );
  }

  const { product, batches } = data;
  const approved = session.companyStatus === "approved";

  const handleBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approved) {
      toast({ title: "You cannot do this.", description: "Wait for company approval.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createBatch({ productId: id, lot, quantity: Number(quantity), expiresAt: expiry });
      toast({ title: "Batch created", description: `Lot ${lot} is ready for codes.` });
      setLot("");
      reload();
    } catch (err) {
      toast({ title: "Could not create batch", description: userMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <Link to="/app/products" className="text-xs text-muted-foreground hover:text-foreground">
          Products
        </Link>
        <h1 className="text-2xl font-light tracking-tight mt-2">{product.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">SKU {product.sku} · {categoryLabel(product.category)}</p>

        <form onSubmit={handleBatch} className="mt-6 bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="lot" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">Lot</Label>
            <Input id="lot" value={lot} onChange={(e) => setLot(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">Units</Label>
            <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">Expiry</Label>
            <Input id="exp" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <Button type="submit" disabled={!approved || saving} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            {saving ? "Saving..." : "New batch"}
          </Button>
        </form>

        <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Lot</th>
                <th className="px-4 py-3 font-normal">Units</th>
                <th className="px-4 py-3 font-normal">Checks</th>
                <th className="px-4 py-3 font-normal">Expiry</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>No batches yet.</td>
                </tr>
              )}
              {batches.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to={`/app/batches/${b.id}`} className="underline underline-offset-4">
                      {b.lot}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{b.size.toLocaleString()}</td>
                  <td className="px-4 py-3">{b.checks}</td>
                  <td className="px-4 py-3">{b.expiry || "—"}</td>
                  <td className="px-4 py-3">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default ProductDetail;
