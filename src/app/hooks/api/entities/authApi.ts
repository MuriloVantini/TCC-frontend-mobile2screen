import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type {
  ApiSuccessResponse,
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ValidateResetPinPayload,
} from "../laravel-api.types";
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
    forgotPassword: async (payload: ForgotPasswordPayload) => {
      const response = await client.post<{ message: string }>("/api/forgot-password", payload, { asFormData: true });
      return response;
    },
    validateResetPin: async (payload: ValidateResetPinPayload) => {
      const response = await client.post<{ message: string }>("/api/validate-reset-pin", payload, { asFormData: true });
      return response;
    },
    resetPassword: async (payload: ResetPasswordPayload) => {
      const response = await client.post<{ message: string }>("/api/reset-password", payload, { asFormData: true });
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
