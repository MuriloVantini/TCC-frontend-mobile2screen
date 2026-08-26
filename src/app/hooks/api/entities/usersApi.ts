import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, UpdatePasswordPayload, UserPayload, UserResource } from "../laravel-api.types";
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
    updatePassword: (userId: number | string, payload: UpdatePasswordPayload) =>
      client.patch<{ message: string }>(`/api/users/${userId}/password`, payload),
    updateProfileImage: async (userId: number | string, image: File) => {
      const body = new FormData();
      body.append("image", image);
      const response = await client.post<ApiSuccessResponse<UserResource>>(`/api/users/${userId}/profile-image`, body);
      return extractEntity<UserResource>(response);
    },
    removeProfileImage: async (userId: number | string) => {
      const response = await client.delete<ApiSuccessResponse<UserResource>>(`/api/users/${userId}/profile-image`);
      return extractEntity<UserResource>(response);
    },
    remove: (userId: number | string) => client.delete<unknown>(`/api/users/${userId}`),
  };
}
