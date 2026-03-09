import type { LucideIcon } from "lucide-react";

export type MapPointType = "rpi" | "tv";
export type MapPointStatus = "active" | "alert" | "inactive";

export interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  type: MapPointType;
  label: string;
  desc: string;
  status: MapPointStatus;
}

export interface MapLayerDef {
  id: "rpi" | "tv";
  label: string;
  icon: LucideIcon;
  color: string;
  active: boolean;
}
