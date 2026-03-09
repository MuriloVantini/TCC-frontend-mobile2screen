import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiKeyPayload, ApiKeyResource, ApiSuccessResponse } from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function useApiKeysApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<ApiKeyResource[]>>("/api/api-keys");
      return extractCollection<ApiKeyResource>(response);
    },
    create: async (payload: ApiKeyPayload) => {
      const response = await client.post<ApiSuccessResponse<ApiKeyResource> | ApiKeyResource>("/api/api-keys", payload);
      return extractEntity<ApiKeyResource>(response);
    },
    update: async (apiKeyId: number | string, payload: ApiKeyPayload) => {
      const response = await client.put<ApiSuccessResponse<ApiKeyResource> | ApiKeyResource>(`/api/api-keys/${apiKeyId}`, payload);
      return extractEntity<ApiKeyResource>(response);
    },
    remove: (apiKeyId: number | string) => client.delete<unknown>(`/api/api-keys/${apiKeyId}`),
  };
}
