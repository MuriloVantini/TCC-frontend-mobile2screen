import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, WebhookPayload, WebhookResource } from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function useWebhooksApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<WebhookResource[]>>("/api/webhooks");
      return extractCollection<WebhookResource>(response);
    },
    create: async (payload: WebhookPayload) => {
      const response = await client.post<ApiSuccessResponse<WebhookResource> | WebhookResource>("/api/webhooks", payload);
      return extractEntity<WebhookResource>(response);
    },
    getById: async (webhookId: number | string) => {
      const response = await client.get<ApiSuccessResponse<WebhookResource>>(`/api/webhooks/${webhookId}`);
      return extractEntity<WebhookResource>(response);
    },
    update: async (webhookId: number | string, payload: WebhookPayload) => {
      const response = await client.put<ApiSuccessResponse<WebhookResource> | WebhookResource>(`/api/webhooks/${webhookId}`, payload);
      return extractEntity<WebhookResource>(response);
    },
    remove: (webhookId: number | string) => client.delete<unknown>(`/api/webhooks/${webhookId}`),
    logs: async (webhookId: number | string) => {
      const response = await client.get<unknown>(`/api/webhooks/${webhookId}/logs`);
      return response;
    },
    test: async (webhookId: number | string) => {
      const response = await client.post<unknown>(`/api/webhooks/${webhookId}/test`);
      return response;
    },
  };
}
