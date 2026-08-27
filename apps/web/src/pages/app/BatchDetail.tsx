import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { useToast } from "@/hooks/use-toast";
import { downloadCodesCsv, generateCodes, getBatch, recallBatch, userMessage } from "@/lib/api";
import { MANUFACTURER_NAV } from "@/lib/nav";

const BatchDetail = () => {
  const { id } = useParams();
  const session = useAuth();
  const { toast } = useToast();
  const { data: batch, error, loading, reload } = useLive(() => getBatch(id ?? ""), [id]);

  if (!session) return <Navigate to="/login" replace />;
  if (!id) return <Navigate to="/app/products" replace />;

  const approved = session.companyStatus === "approved";

  const run = async (fn: () => Promise<unknown>, ok: string, detail: string) => {
    try {
      await fn();
      toast({ title: ok, description: detail });
      reload();
    } catch (err) {
      toast({ title: "Could not complete this action", description: userMessage(err), variant: "destructive" });
    }
  };

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-3xl">
        {batch?.productId && (
          <Link to={`/app/products/${batch.productId}`} className="text-xs text-muted-foreground hover:text-foreground">
            Back to product
          </Link>
        )}
        {loading && <p className="text-sm text-muted-foreground mt-4">Loading…</p>}
        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        {batch && (
          <>
            <h1 className="text-2xl font-light tracking-tight mt-2">Batch {batch.lot}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {batch.size.toLocaleString()} units · {batch.checks} checks · expiry {batch.expiry || "—"}
            </p>
            <p className="text-sm mt-4">
              Do not dump tens of thousands of codes in this page. Generate, then export CSV for print.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                disabled={!approved}
                className="rounded-full text-[11px] uppercase tracking-wider font-normal"
                onClick={() => run(() => generateCodes(id), "Codes generated", "Units were written in SQLite. Export CSV for print.")}
              >
                Generate codes
              </Button>
              <Button
                variant="outline"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal"
                onClick={() => run(() => downloadCodesCsv(id), "CSV exported", "Save the file for the pack line.")}
              >
                Export CSV
              </Button>
              <Button
                variant="destructive"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal"
                onClick={() => run(() => recallBatch(id), "Batch recalled", "Future checks of these codes will say Recalled.")}
              >
                Recall batch
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default BatchDetail;
