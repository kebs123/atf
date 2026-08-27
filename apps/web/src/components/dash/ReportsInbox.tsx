import { Link } from "react-router-dom";
import { listReports, patchReportStatus, userMessage, type CounterfeitReport, type ReportStatus } from "@/lib/api";
import { useLive } from "@/hooks/use-live";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUSES: ReportStatus[] = ["open", "reviewing", "closed"];

export function ReportsInbox({
  showCompany,
  showTrace,
  scope,
}: {
  showCompany?: boolean;
  showTrace?: boolean;
  scope?: "admin" | "company";
}) {
  const { toast } = useToast();
  const { data, error, loading, reload } = useLive(() => listReports(scope), [scope]);
  const rows = data ?? [];

  const update = async (id: string, status: ReportStatus) => {
    try {
      await patchReportStatus(id, status);
      reload();
    } catch (err) {
      toast({ title: "Could not update report", description: userMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="mt-8 space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}
      {rows.map((r) => (
        <ReportCard
          key={r.id}
          report={r}
          showCompany={showCompany}
          showTrace={showTrace}
          onStatus={(status) => update(r.id, status)}
        />
      ))}
    </div>
  );
}

function ReportCard({
  report,
  showCompany,
  showTrace,
  onStatus,
}: {
  report: CounterfeitReport;
  showCompany?: boolean;
  showTrace?: boolean;
  onStatus: (status: ReportStatus) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="font-mono text-sm">{report.code}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {report.place || "Place not given"}
            {showCompany ? ` · ${report.company}` : ""}
            {" · "}
            {report.at}
          </p>
          {report.note && <p className="text-sm mt-2">{report.note}</p>}
          {report.contact && <p className="text-xs text-muted-foreground mt-2">Contact: {report.contact}</p>}
        </div>
        <span
          className={cn(
            "text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border h-fit",
            report.status === "open" && "border-destructive/40 text-destructive",
            report.status === "reviewing" && "border-amber-500/40 text-amber-800 dark:text-amber-200",
            report.status === "closed" && "border-border text-muted-foreground",
          )}
        >
          {report.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatus(status)}
            className={cn(
              "text-[11px] uppercase tracking-wider rounded-full border px-3 py-1",
              report.status === status ? "bg-primary text-primary-foreground border-primary" : "border-border",
            )}
          >
            {status}
          </button>
        ))}
        {showTrace && (
          <Link
            to={`/app/shipments?focus=${encodeURIComponent(report.code)}&trace=1`}
            className="text-[11px] uppercase tracking-wider rounded-full border border-border px-3 py-1"
          >
            Open on Trace
          </Link>
        )}
      </div>
    </div>
  );
}
