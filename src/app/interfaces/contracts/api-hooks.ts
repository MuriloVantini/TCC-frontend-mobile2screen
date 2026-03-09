import type { ActivityPoint, AlertHistoryRecord, RecentAlert } from "../types/alert";
import type { Device } from "../types/device";
import type { MapLayerDef, MapPoint } from "../types/map";

export interface DevicesApiHookContract {
  devices: Device[];
}

export interface AlertsApiHookContract {
  activityData: ActivityPoint[];
  recentAlerts: RecentAlert[];
  alertHistory: AlertHistoryRecord[];
}

export interface MapApiHookContract {
  mapPoints: MapPoint[];
  layerDefs: MapLayerDef[];
}
