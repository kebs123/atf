import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxStyle, mapboxToken } from "@/lib/mapbox";
import { isCheckAnomalous, KENYA_CENTER, shipmentLine, type GeoCheck, type Shipment } from "@/lib/trace";
import { resultLabel } from "@/lib/results";
import { cn } from "@/lib/utils";

export type TraceLayer = "all" | "deliveries" | "checks" | "anomalies";

type Props = {
  shipments: Shipment[];
  checks: GeoCheck[];
  layer: TraceLayer;
  selectedShipmentId: string | null;
  selectedCheckId: string | null;
  onSelectShipment: (id: string) => void;
  onSelectCheck: (id: string) => void;
  mode3d: boolean;
  onMode3dChange: (next: boolean) => void;
  onFocusAlarms?: () => void;
  className?: string;
};

function visibleChecks(checks: GeoCheck[], layer: TraceLayer) {
  if (layer === "anomalies" || layer === "deliveries") return checks.filter(isCheckAnomalous);
  return checks;
}

function bearingDeg(from: { lng: number; lat: number }, to: { lng: number; lat: number }) {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function enableTerrain(map: mapboxgl.Map) {
  if (!map.getSource("mapbox-dem")) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
  }
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.7 });
  if (!map.getLayer("sky")) {
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 80.0],
        "sky-atmosphere-sun-intensity": 12,
      },
    });
  }
  if (map.getSource("composite") && !map.getLayer("3d-buildings")) {
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": "#6b4423",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.72,
      },
    });
  }
  map.setFog({
    color: "rgb(210, 190, 165)",
    "high-color": "rgb(80, 55, 35)",
    "horizon-blend": 0.08,
    "space-color": "rgb(18, 12, 8)",
    "star-intensity": 0.35,
  });
}

export function TraceMap({
  shipments,
  checks,
  layer,
  selectedShipmentId,
  selectedCheckId,
  onSelectShipment,
  onSelectCheck,
  mode3d,
  onMode3dChange,
  onFocusAlarms,
  className,
}: Props) {
  const token = mapboxToken();
  const styleUrl = mapboxStyle();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const callbacksRef = useRef({ onSelectShipment, onSelectCheck });
  callbacksRef.current = { onSelectShipment, onSelectCheck };
  const mode3dRef = useRef(mode3d);
  mode3dRef.current = mode3d;

  const alarmCount = checks.filter(isCheckAnomalous).length;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [36.82, -0.55],
      zoom: 5.6,
      pitch: 0,
      bearing: 0,
      maxPitch: 85,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.on("load", () => enableTerrain(map));
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [token, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !token) return;

    const applyCamera = () => {
      if (!map.isStyleLoaded()) return;
      enableTerrain(map);
      if (mode3d) {
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.7 });
        const selectedCheck = checks.find((c) => c.id === selectedCheckId);
        const selectedShip = shipments.find((s) => s.id === selectedShipmentId);
        if (selectedCheck) {
          map.easeTo({
            center: [selectedCheck.lng, selectedCheck.lat],
            zoom: 12.2,
            pitch: 68,
            bearing: 32,
            duration: 1600,
          });
        } else if (selectedShip) {
          map.easeTo({
            center: [selectedShip.destination.lng, selectedShip.destination.lat],
            zoom: 10.4,
            pitch: 64,
            bearing: bearingDeg(selectedShip.origin, selectedShip.destination),
            duration: 1600,
          });
        } else {
          map.easeTo({ center: [36.4, -0.4], zoom: 6.6, pitch: 62, bearing: 18, duration: 1600 });
        }
      } else {
        map.setTerrain({ source: "mapbox-dem", exaggeration: 0.35 });
        map.easeTo({ pitch: 0, bearing: 0, duration: 900 });
      }
    };

    if (map.isStyleLoaded()) applyCamera();
    else map.once("load", applyCamera);
  }, [token, styleUrl, mode3d, selectedCheckId, selectedShipmentId, checks, shipments]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !token) return;

    let cancelled = false;

    const draw = () => {
      if (cancelled || !map.isStyleLoaded()) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();

      const routes = shipments;
      const points = visibleChecks(checks, layer);

      const geojson = {
        type: "FeatureCollection" as const,
        features: routes.map((s) => ({
          type: "Feature" as const,
          properties: { id: s.id, selected: s.id === selectedShipmentId ? 1 : 0 },
          geometry: { type: "LineString" as const, coordinates: shipmentLine(s) },
        })),
      };

      if (map.getSource("routes")) {
        (map.getSource("routes") as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource("routes", { type: "geojson", data: geojson });
        map.addLayer({
          id: "routes-halo",
          type: "line",
          source: "routes",
          paint: {
            "line-color": "#f4e6d4",
            "line-width": 10,
            "line-opacity": 0.28,
          },
        });
        map.addLayer({
          id: "routes-line",
          type: "line",
          source: "routes",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": ["case", ["==", ["get", "selected"], 1], "#8b5a2b", "#a67c52"],
            "line-width": ["case", ["==", ["get", "selected"], 1], 6, 3.5],
            "line-opacity": 0.95,
          },
        });
      }

      if (layer !== "checks" && routes.length > 0) {
        const factoryEl = document.createElement("div");
        factoryEl.className = "trace-dot trace-dot-factory";
        factoryEl.title = KENYA_CENTER.name;
        markersRef.current.push(new mapboxgl.Marker({ element: factoryEl }).setLngLat([KENYA_CENTER.lng, KENYA_CENTER.lat]).addTo(map));
      }

      if (layer !== "checks") {
        for (const s of routes) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = "trace-dot trace-dot-dest";
          el.title = s.destination.name;
          el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            callbacksRef.current.onSelectShipment(s.id);
          });
          markersRef.current.push(
            new mapboxgl.Marker({ element: el }).setLngLat([s.destination.lng, s.destination.lat]).addTo(map),
          );
        }
      }

      for (const c of points) {
        const anomalous = isCheckAnomalous(c);
        const wrap = document.createElement("button");
        wrap.type = "button";
        wrap.className = cn("trace-pin", anomalous && "trace-pin-alarm");
        wrap.title = anomalous ? `Alarm · ${c.code} · ${c.place}` : `${c.code} · ${c.place}`;
        wrap.innerHTML = anomalous
          ? `<span class="trace-dot trace-dot-alert trace-pulse"></span><span class="trace-pin-label">Alarm</span>`
          : `<span class="trace-dot trace-dot-ok"></span>`;
        wrap.addEventListener("click", (ev) => {
          ev.stopPropagation();
          callbacksRef.current.onSelectCheck(c.id);
        });
        markersRef.current.push(new mapboxgl.Marker({ element: wrap, anchor: "bottom" }).setLngLat([c.lng, c.lat]).addTo(map));
      }

      const selectedCheck = checks.find((c) => c.id === selectedCheckId);
      if (selectedCheck) {
        popupRef.current = new mapboxgl.Popup({ offset: 22, closeButton: false })
          .setLngLat([selectedCheck.lng, selectedCheck.lat])
          .setHTML(
            `<p class="font-mono text-xs">${selectedCheck.code}</p>
             <p>${isCheckAnomalous(selectedCheck) ? "Alarm · " : ""}${resultLabel(selectedCheck.result)} · ${selectedCheck.place}</p>
             <p>${selectedCheck.inTerritory ? "In authorized corridor" : "Outside authorized territory"}</p>
             <p class="text-[11px] opacity-70">Approximate location · not live GPS</p>`,
          )
          .addTo(map);
      }
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
    return () => {
      cancelled = true;
    };
  }, [token, styleUrl, shipments, checks, layer, selectedShipmentId, selectedCheckId]);

  if (!token) return null;

  return (
    <div className={cn("relative h-full w-full min-h-[360px]", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onMode3dChange(!mode3d)}
          className={cn(
            "rounded-full px-4 py-2 text-[11px] uppercase tracking-wider shadow-soft border",
            mode3d
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/90 text-foreground border-border backdrop-blur-md",
          )}
        >
          Trace
        </button>
        <button
          type="button"
          onClick={() => {
            onFocusAlarms?.();
            onMode3dChange(true);
          }}
          className="rounded-full px-4 py-2 text-[11px] uppercase tracking-wider shadow-soft border border-destructive/40 bg-destructive text-destructive-foreground"
        >
          Alarms {alarmCount}
        </button>
      </div>
    </div>
  );
}

export function MapTokenEmpty() {
  return (
    <div className="h-full min-h-[360px] grid place-items-center p-8 text-center bg-secondary/40">
      <div className="max-w-sm">
        <p className="text-sm font-medium">Mapbox token missing</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add <code className="text-xs">VITE_MAPBOX_ACCESS_TOKEN</code> to <code className="text-xs">apps/web/.env</code> (see{" "}
          <code className="text-xs">.env.example</code>) and restart the dev server. The list still works.
        </p>
      </div>
    </div>
  );
}
