import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type {
  ApiSuccessResponse,
  DevicePayload,
  DeviceResource,
  HeartbeatPayload,
  HeartbeatResponse,
} from "../laravel-api.types";
import { extractCollection, extractData, extractEntity, isRecord, type UnknownRecord } from "./shared";

export function useDevicesApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<DeviceResource[]>>("/api/devices");
      return extractCollection<DeviceResource>(response);
    },
    latest: async () => {
      const response = await client.get<ApiSuccessResponse<DeviceResource[]>>("/api/devices/latest");
      return extractCollection<DeviceResource>(response);
    },
    create: async (payload: DevicePayload) => {
      const response = await client.post<ApiSuccessResponse<DeviceResource> | DeviceResource>("/api/devices", payload);
      return extractEntity<DeviceResource>(response);
    },
    getById: async (deviceId: number | string) => {
      const response = await client.get<ApiSuccessResponse<DeviceResource>>(`/api/devices/${deviceId}`);
      return extractEntity<DeviceResource>(response);
    },
    update: async (deviceId: number | string, payload: DevicePayload) => {
      const response = await client.put<ApiSuccessResponse<DeviceResource> | DeviceResource>(`/api/devices/${deviceId}`, payload);
      return extractEntity<DeviceResource>(response);
    },
    remove: (deviceId: number | string) => client.delete<unknown>(`/api/devices/${deviceId}`),
    heartbeat: async (deviceId: number | string, payload?: HeartbeatPayload) => {
      const response = await client.post<HeartbeatResponse>(`/api/devices/${deviceId}/heartbeat`, payload ?? {});
      return response;
    },
    regenerateToken: async (deviceId: number | string) => {
      const response = await client.post<unknown>(`/api/devices/${deviceId}/regenerate-token`);
      if (isRecord(response) && typeof response.token === "string") {
        return { token: response.token };
      }

      const data = extractData<UnknownRecord>(response);
      if (isRecord(data) && typeof data.token === "string") {
        return { token: data.token };
      }

      return {};
    },
  };
}
