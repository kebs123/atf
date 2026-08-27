import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { MapTokenEmpty, TraceMap } from "@/components/dash/TraceMap";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { getShipment, listVerifications, verificationsToGeo } from "@/lib/api";
import { isCheckAnomalous } from "@/lib/trace";
import { resultLabel } from "@/lib/results";
import { categoryLabel } from "@/lib/categories";
import { mapboxToken } from "@/lib/mapbox";
import { MANUFACTURER_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const ShipmentDetail = () => {
  const session = useAuth();
  const { id } = useParams();
  const token = mapboxToken();
  const shipmentLive = useLive(() => getShipment(id ?? ""), [id]);
  const checksLive = useLive(() => listVerifications(200));
  const shipment = shipmentLive.data;
  const checks = useMemo(() => {
    const geo = verificationsToGeo(checksLive.data ?? []);
    if (!shipment) return geo;
    return geo.filter((c) => c.shipmentId === shipment.id);
  }, [checksLive.data, shipment]);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [mode3d, setMode3d] = useState(false);

  if (!session) return <Navigate to="/login" replace />;
  if (shipmentLive.loading) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }
  if (!shipment) {
    return (
      <AppShell session={session} items={MANUFACTURER_NAV}>
        <p className="text-sm text-muted-foreground">Shipment not found. The live API does not list this corridor.</p>
        <Link to="/app/shipments" className="text-sm text-primary mt-3 inline-block">
          Back to Trace
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-6xl">
        <Link to="/app/shipments" className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Trace
        </Link>
        <h1 className="text-2xl font-light tracking-tight mt-2">{shipment.destination.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {categoryLabel(shipment.category)} · batch {shipment.batch} · {shipment.units.toLocaleString()} units
        </p>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-4">
          <div className="rounded-2xl border border-border overflow-hidden min-h-[520px] h-[58vh] bg-card">
            {token ? (
              <TraceMap
                shipments={[shipment]}
                checks={checks}
                layer="all"
                selectedShipmentId={shipment.id}
                selectedCheckId={selectedCheckId}
                mode3d={mode3d}
                onMode3dChange={setMode3d}
                onFocusAlarms={() => {
                  const alarm = checks.find(isCheckAnomalous);
                  if (alarm) setSelectedCheckId(alarm.id);
                  setMode3d(true);
                }}
                onSelectShipment={() => setSelectedCheckId(null)}
                onSelectCheck={setSelectedCheckId}
              />
            ) : (
              <MapTokenEmpty />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Timeline</p>
              <ol className="mt-3 space-y-3">
                {shipment.timeline.length === 0 && <li className="text-sm text-muted-foreground">No custody events.</li>}
                {shipment.timeline.map((step) => (
                  <li key={step.label} className="text-sm">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground"> · {step.at}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Checks on this route</p>
              <ul className="mt-3 space-y-2">
                {checks.length === 0 && <li className="text-sm text-muted-foreground">None with coordinates.</li>}
                {checks.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCheckId(c.id)}
                      className={cn(
                        "w-full text-left rounded-xl border px-3 py-2",
                        selectedCheckId === c.id ? "border-primary" : "border-border",
                        isCheckAnomalous(c) && "border-destructive/40",
                      )}
                    >
                      <p className="font-mono text-xs">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {resultLabel(c.result)} · {c.place}
                        {!c.inTerritory ? " · outside territory" : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ShipmentDetail;
