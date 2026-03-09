import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type {
  AlertsByTypeStatistics,
  ApiSuccessResponse,
  DailyStatistics,
  DashboardStatistics,
  TopDevicesStatistics,
} from "../laravel-api.types";
import { extractCollection, extractEntity } from "./shared";

export function useStatisticsApi(client: ApiClient = defaultApiClient) {
  return {
    dashboard: async () => {
      const response = await client.get<ApiSuccessResponse<DashboardStatistics>>("/api/statistics/dashboard");
      return extractEntity<DashboardStatistics>(response);
    },
    daily: async () => {
      const response = await client.get<ApiSuccessResponse<DailyStatistics[]>>("/api/statistics/daily");
      return extractCollection<DailyStatistics>(response);
    },
    alertsByType: async () => {
      const response = await client.get<ApiSuccessResponse<AlertsByTypeStatistics[]>>("/api/statistics/alerts-by-type");
      return extractCollection<AlertsByTypeStatistics>(response);
    },
    topDevices: async () => {
      const response = await client.get<ApiSuccessResponse<TopDevicesStatistics[]>>("/api/statistics/top-devices");
      return extractCollection<TopDevicesStatistics>(response);
    },
  };
}
