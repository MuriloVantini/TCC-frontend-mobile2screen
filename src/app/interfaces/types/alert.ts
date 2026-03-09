export type AlertType = "info" | "warning" | "critical" | "success";

export interface ActivityPoint {
  hora: string;
  alertas: number;
}

export interface RecentAlert {
  id: number;
  title: string;
  type: AlertType;
  tags: string[];
  devices: number;
  status: "delivered" | "failed";
  time: string;
}

export interface AlertHistoryRecord {
  id: number;
  title: string;
  message: string;
  type: AlertType;
  tags: string[];
  devices: number;
  delivered: number;
  failed: number;
  duration: string;
  sentAt: string;
}
