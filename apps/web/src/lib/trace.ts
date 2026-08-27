import type { CategoryId } from "@/lib/categories";
import type { ResultCode } from "@/lib/results";

export type GeoPoint = { lng: number; lat: number; name: string };
export type ShipmentStatus = "Packed" | "In transit" | "Received";

export type Shipment = {
  id: string;
  to: string;
  units: number;
  batch: string;
  category: CategoryId;
  status: ShipmentStatus;
  at: string;
  origin: GeoPoint;
  destination: GeoPoint;
  waypoints: GeoPoint[];
  corridorKm: number;
  timeline: { label: string; at: string }[];
};

export type GeoCheck = {
  id: string;
  code: string;
  product: string;
  category: CategoryId;
  result: ResultCode;
  channel: "sms" | "web";
  at: string;
  lng: number;
  lat: number;
  place: string;
  shipmentId: string | null;
  inTerritory: boolean;
};

export const KENYA_CENTER: GeoPoint = {
  lng: 36.8219,
  lat: -1.2921,
  name: "Kenya",
};

export function isCheckAnomalous(check: GeoCheck) {
  return !check.inTerritory || check.result === "unknown" || check.result === "flagged";
}

export function shipmentLine(s: Shipment): [number, number][] {
  return [
    [s.origin.lng, s.origin.lat],
    ...s.waypoints.map((w) => [w.lng, w.lat] as [number, number]),
    [s.destination.lng, s.destination.lat],
  ];
}

export function hasCoords(lng?: number, lat?: number) {
  return typeof lng === "number" && typeof lat === "number" && Number.isFinite(lng) && Number.isFinite(lat);
}
