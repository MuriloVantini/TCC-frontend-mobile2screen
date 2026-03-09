import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, SettingsPayload } from "../laravel-api.types";
import { extractEntity } from "./shared";

export function useSettingsApi(client: ApiClient = defaultApiClient) {
  return {
    get: async () => {
      const response = await client.get<ApiSuccessResponse<SettingsPayload>>("/api/settings");
      return extractEntity<SettingsPayload>(response);
    },
    update: async (payload: SettingsPayload) => {
      const response = await client.put<ApiSuccessResponse<SettingsPayload> | SettingsPayload>("/api/settings", payload);
      return extractEntity<SettingsPayload>(response);
    },
  };
}
