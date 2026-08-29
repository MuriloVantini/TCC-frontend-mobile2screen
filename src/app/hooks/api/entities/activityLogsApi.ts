import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ActivityLogResource, ApiSuccessResponse } from "../laravel-api.types";
import { extractCollection } from "./shared";

export interface ActivityLogFilters {
  userId?: number;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

export function useActivityLogsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async (filters: ActivityLogFilters = {}) => {
      const params = new URLSearchParams();
      if (filters.userId) params.set("user_id", String(filters.userId));
      if (filters.action) params.set("action", filters.action);
      if (filters.fromDate) params.set("from_date", filters.fromDate);
      if (filters.toDate) params.set("to_date", filters.toDate);
      params.set("per_page", "100");
      const response = await client.get<ApiSuccessResponse<ActivityLogResource[]>>(`/api/activity-logs?${params}`);
      return extractCollection<ActivityLogResource>(response);
    },
  };
}
