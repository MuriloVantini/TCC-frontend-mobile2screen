import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, DeviceResource, TagPayload, TagResource } from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function useTagsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<TagResource[]>>("/api/tags");
      return extractCollection<TagResource>(response);
    },
    create: async (payload: TagPayload) => {
      const response = await client.post<ApiSuccessResponse<TagResource> | TagResource>("/api/tags", payload);
      return extractEntity<TagResource>(response);
    },
    getById: async (tagId: number | string) => {
      const response = await client.get<ApiSuccessResponse<TagResource>>(`/api/tags/${tagId}`);
      return extractEntity<TagResource>(response);
    },
    update: async (tagId: number | string, payload: TagPayload) => {
      const response = await client.put<ApiSuccessResponse<TagResource> | TagResource>(`/api/tags/${tagId}`, payload);
      return extractEntity<TagResource>(response);
    },
    remove: (tagId: number | string) => client.delete<unknown>(`/api/tags/${tagId}`),
    devices: async (tagId: number | string) => {
      const response = await client.get<ApiSuccessResponse<DeviceResource[]>>(`/api/tags/${tagId}/devices`);
      return extractCollection<DeviceResource>(response);
    },
  };
}
