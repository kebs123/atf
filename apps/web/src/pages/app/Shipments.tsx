import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/dash/AppShell";
import { MapTokenEmpty, TraceMap, type TraceLayer } from "@/components/dash/TraceMap";
import { useAuth } from "@/hooks/use-auth";
import { useLive } from "@/hooks/use-live";
import { listShipments, listVerifications, verificationsToGeo } from "@/lib/api";
import { isCheckAnomalous } from "@/lib/trace";
import { resultLabel } from "@/lib/results";
import { categoryLabel } from "@/lib/categories";
import { mapboxToken } from "@/lib/mapbox";
import { MANUFACTURER_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

const LAYERS: { id: TraceLayer; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deliveries", label: "Deliveries" },
  { id: "checks", label: "Checks" },
  { id: "anomalies", label: "Alarms" },
];

const Shipments = () => {
  const session = useAuth();
  const [searchParams] = useSearchParams();
  const token = mapboxToken();
  const shipmentsLive = useLive(listShipments);
  const checksLive = useLive(() => listVerifications(200));
  const shipments = shipmentsLive.data ?? [];
  const allChecks = checksLive.data ?? [];
  const geoChecks = useMemo(() => verificationsToGeo(allChecks), [allChecks]);
  const [layer, setLayer] = useState<TraceLayer>("all");
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [mode3d, setMode3d] = useState(false);

  const alarms = useMemo(() => geoChecks.filter(isCheckAnomalous), [geoChecks]);

  useEffect(() => {
    if (!selectedShipmentId && shipments[0]) setSelectedShipmentId(shipments[0].id);
  }, [shipments, selectedShipmentId]);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (!focus) return;
    const check = geoChecks.find((c) => c.code.toUpperCase() === focus.toUpperCase());
    if (!check) return;
    setSelectedCheckId(check.id);
    if (check.shipmentId) setSelectedShipmentId(check.shipmentId);
    if (searchParams.get("trace") === "1") setMode3d(true);
    if (isCheckAnomalous(check)) setLayer("anomalies");
  }, [searchParams, geoChecks]);

  if (!session) return <Navigate to="/login" replace />;

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId);
  const err = shipmentsLive.error || checksLive.error;

  return (
    <AppShell session={session} items={MANUFACTURER_NAV}>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-light tracking-tight">Trace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live checks on the map when the API includes coordinates. Corridors appear if custody/shipments exist. Locations are approximate.
        </p>
        {err && <p className="text-sm text-destructive mt-4">{err}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {LAYERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLayer(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider border",
                layer === item.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-4">
          <div className="rounded-2xl border border-border overflow-hidden min-h-[520px] h-[58vh] bg-card">
            {token ? (
              <TraceMap
                shipments={shipments}
                checks={geoChecks}
                layer={layer}
                selectedShipmentId={selectedShipmentId}
                selectedCheckId={selectedCheckId}
                mode3d={mode3d}
                onMode3dChange={setMode3d}
                onFocusAlarms={() => {
                  const alarm = alarms[0];
                  if (alarm) {
                    setSelectedCheckId(alarm.id);
                    if (alarm.shipmentId) setSelectedShipmentId(alarm.shipmentId);
                  }
                  setLayer("anomalies");
                }}
                onSelectShipment={(sid) => {
                  setSelectedShipmentId(sid);
                  setSelectedCheckId(null);
                }}
                onSelectCheck={setSelectedCheckId}
              />
            ) : (
              <MapTokenEmpty />
            )}
            {geoChecks.length === 0 && shipments.length === 0 && !checksLive.loading && (
              <p className="absolute mt-[-12rem] mx-6 text-sm text-muted-foreground pointer-events-none">
                No mapped checks yet. When verifications include lat/lng they will show here.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Shipments</p>
              <ul className="mt-3 space-y-2">
                {shipments.length === 0 && <li className="text-sm text-muted-foreground">No live corridors.</li>}
                {shipments.map((s) => (
                  <li key={s.id}>
                    <div
                      className={cn(
                        "rounded-xl border px-3 py-2",
                        selectedShipmentId === s.id ? "border-primary" : "border-border",
                      )}
                    >
                      <button type="button" className="w-full text-left" onClick={() => setSelectedShipmentId(s.id)}>
                        <p className="text-sm">{s.destination.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel(s.category)} · {s.status}
                        </p>
                      </button>
                      <Link to={`/app/shipments/${s.id}`} className="text-[11px] uppercase tracking-wider text-primary mt-1 inline-block">
                        Open route
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Checks</p>
              <ul className="mt-3 space-y-2 max-h-64 overflow-auto">
                {allChecks.length === 0 && <li className="text-sm text-muted-foreground">No checks yet.</li>}
                {allChecks.slice(0, 30).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCheckId(c.id);
                        if (c.shipmentId) setSelectedShipmentId(c.shipmentId);
                      }}
                      className={cn(
                        "w-full text-left rounded-xl border px-3 py-2",
                        selectedCheckId === c.id ? "border-primary" : "border-border",
                      )}
                    >
                      <p className="font-mono text-xs">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {resultLabel(c.result)} · {c.place}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {selectedShipment && (
          <p className="text-xs text-muted-foreground mt-4">
            Selected: {selectedShipment.destination.name} · batch {selectedShipment.batch}
            {selectedShipment.corridorKm ? ` · ~${selectedShipment.corridorKm} km` : ""}
          </p>
        )}
      </div>
    </AppShell>
  );
};

export default Shipments;
