export type DeviceType = "tv" | "rpi";

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  online: boolean;
  tags: string[];
  location?: string;
  lastSeen?: string;
  ip?: string;
}
