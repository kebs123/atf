import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_BATCHES } from "@/lib/demo-data";
import { MANUFACTURER_NAV } from "@/lib/nav";

const BatchDetail = () => {
  const { id } = useParams();
  const session = useAuth();
  const { toast } = useToast();
  if (!session) return <Navigate to="/login" replace />;

  const batch = Object.values(PRODUCT_BATCHES).flat().find((b) => b.id === id);
  const productId = Object.entries(PRODUCT_BATCHES).find(([, list]) => list.some((b) => b.id === id))?.[0];

  if (!batch) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p>Not found.</p>
      </AppShell>
    );
  }

  const approved = session.companyStatus === "approved";

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-3xl">
        {productId && (
          <Link to={`/app/products/${productId}`} className="text-xs text-muted-foreground hover:text-foreground">
            Back to product
          </Link>
        )}
        <h1 className="text-2xl font-light tracking-tight mt-2">Batch {batch.lot}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {batch.size.toLocaleString()} units · {batch.checks} checks · expiry {batch.expiry}
        </p>
        <p className="text-sm mt-4">
          Do not dump tens of thousands of codes in this page. Generate, then export CSV for print.
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            disabled={!approved}
            className="rounded-full text-[11px] uppercase tracking-wider font-normal"
            onClick={() => toast({ title: "Codes generated", description: "Demo only. POST /batches/:id/codes later." })}
          >
            Generate codes
          </Button>
          <Button
            variant="outline"
            className="rounded-full text-[11px] uppercase tracking-wider font-normal"
            onClick={() => toast({ title: "CSV export", description: "GET /batches/:id/codes.csv later." })}
          >
            Export CSV
          </Button>
          <Button
            variant="destructive"
            className="rounded-full text-[11px] uppercase tracking-wider font-normal"
            onClick={() => toast({ title: "Batch recalled", description: "POST /batches/:id/recall later." })}
          >
            Recall batch
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default BatchDetail;
