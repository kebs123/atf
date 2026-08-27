import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTS, PRODUCT_BATCHES } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";
import { MANUFACTURER_NAV } from "@/lib/nav";

const ProductDetail = () => {
  const { id } = useParams();
  const session = useAuth();
  const { toast } = useToast();
  if (!session) return <Navigate to="/login" replace />;

  const product = PRODUCTS.find((p) => p.id === id);
  const batches = (id && PRODUCT_BATCHES[id]) || [];

  if (!product) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p>Not found.</p>
        <Link to="/app/products" className="text-sm underline">
          Back to products
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-5xl">
        <Link to="/app/products" className="text-xs text-muted-foreground hover:text-foreground">
          Products
        </Link>
        <h1 className="text-2xl font-light tracking-tight mt-2">{product.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">SKU {product.sku} · {categoryLabel(product.category)}</p>
        <Button
          className="mt-6 rounded-full text-[11px] uppercase tracking-wider font-normal"
          onClick={() => toast({ title: "Batch noted", description: "POST /batches when Express exists." })}
          disabled={session.companyStatus !== "approved"}
        >
          New batch
        </Button>

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
              {batches.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to={`/app/batches/${b.id}`} className="underline underline-offset-4">
                      {b.lot}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{b.size.toLocaleString()}</td>
                  <td className="px-4 py-3">{b.checks}</td>
                  <td className="px-4 py-3">{b.expiry}</td>
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
