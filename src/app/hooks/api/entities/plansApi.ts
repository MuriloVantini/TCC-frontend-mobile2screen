import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, PlanResource } from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function usePlansApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<PlanResource[]>>("/api/plans");
      return extractCollection<PlanResource>(response);
    },
    getById: async (planId: number | string) => {
      const response = await client.get<ApiSuccessResponse<PlanResource>>(`/api/plans/${planId}`);
      return extractEntity<PlanResource>(response);
    },
  };
}
