import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, UserPayload, UserResource } from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function useUsersApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<UserResource[]>>("/api/users");
      return extractCollection<UserResource>(response);
    },
    create: async (payload: UserPayload) => {
      const response = await client.post<ApiSuccessResponse<UserResource> | UserResource>("/api/users", payload);
      return extractEntity<UserResource>(response);
    },
    getById: async (userId: number | string) => {
      const response = await client.get<ApiSuccessResponse<UserResource>>(`/api/users/${userId}`);
      return extractEntity<UserResource>(response);
    },
    update: async (userId: number | string, payload: UserPayload) => {
      const response = await client.put<ApiSuccessResponse<UserResource> | UserResource>(`/api/users/${userId}`, payload);
      return extractEntity<UserResource>(response);
    },
    remove: (userId: number | string) => client.delete<unknown>(`/api/users/${userId}`),
  };
}
