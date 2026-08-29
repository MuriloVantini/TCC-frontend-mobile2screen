import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, RealtimeConfig } from "../laravel-api.types";
import { extractEntity } from "./shared";

export function useRealtimeApi(client: ApiClient = defaultApiClient) {
  return {
    config: async () => {
      const response = await client.get<ApiSuccessResponse<RealtimeConfig>>("/api/realtime/config");
      return extractEntity<RealtimeConfig>(response);
    },
    authorize: (socketId: string, channelName: string) =>
      client.post<{ auth: string }>("/api/realtime/authorize", {
        socket_id: socketId,
        channel_name: channelName,
      }),
  };
}
