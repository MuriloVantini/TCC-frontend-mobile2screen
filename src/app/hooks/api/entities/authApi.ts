import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "../laravel-api.types";
import { clearToken, extractEntity, saveToken } from "./shared";

export function useAuthApi(client: ApiClient = defaultApiClient) {
  return {
    register: async (payload: RegisterPayload) => {
      const response = await client.post<AuthResponse>("/api/register", payload, { asFormData: true });
      saveToken(client, response.token);
      return response;
    },
    login: async (payload: LoginPayload) => {
      const response = await client.post<AuthResponse>("/api/login", payload, { asFormData: true });
      saveToken(client, response.token);
      return response;
    },
    user: async () => {
      const response = await client.get<ApiSuccessResponse<AuthUser>>("/api/user");
      return extractEntity<AuthUser>(response);
    },
    logout: async () => {
      const response = await client.post<unknown>("/api/logout");
      clearToken(client);
      return response;
    },
  };
}
