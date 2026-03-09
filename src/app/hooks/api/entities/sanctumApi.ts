import { defaultApiClient, type ApiClient } from "../config/httpClient";

export function useSanctumApi(client: ApiClient = defaultApiClient) {
  return {
    csrfCookie: () => client.get<unknown>("/sanctum/csrf-cookie"),
  };
}
