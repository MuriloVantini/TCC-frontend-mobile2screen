import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type {
  AlertDetailsData,
  AlertPayload,
  AlertResource,
  ApiSuccessResponse,
  DeliveryResource,
  PaginationData,
} from "../laravel-api.types";
import { extractCollection, extractData, extractEntity, extractNestedEntity, isRecord } from "./shared";

export interface AlertsListResult {
  items: AlertResource[];
  pagination?: PaginationData<AlertResource>;
}

export interface AlertCreateResult {
  alert: AlertResource;
  devices_count?: number;
  online_devices?: number;
}

function parseAlertsList(response: unknown): AlertsListResult {
  const data = extractData<unknown>(response);

  if (isRecord(data) && Array.isArray(data.data)) {
    const pagination: PaginationData<AlertResource> = {
      data: data.data as AlertResource[],
      current_page: typeof data.current_page === "number" ? data.current_page : undefined,
      per_page: typeof data.per_page === "number" ? data.per_page : undefined,
      total: typeof data.total === "number" ? data.total : undefined,
      last_page: typeof data.last_page === "number" ? data.last_page : undefined,
    };

    return {
      items: pagination.data,
      pagination,
    };
  }

  if (Array.isArray(data)) {
    return { items: data as AlertResource[] };
  }

  return { items: [] };
}

export function useAlertsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<PaginationData<AlertResource>> | ApiSuccessResponse<AlertResource[]>>(
        "/api/alerts"
      );
      return parseAlertsList(response);
    },
    create: async (payload: AlertPayload) => {
      const response = await client.post<unknown>("/api/alerts", payload);
      const data = extractData<unknown>(response);

      if (isRecord(data) && isRecord(data.alert)) {
        return {
          alert: data.alert as AlertResource,
          devices_count: typeof data.devices_count === "number" ? data.devices_count : undefined,
          online_devices: typeof data.online_devices === "number" ? data.online_devices : undefined,
        } satisfies AlertCreateResult;
      }

      return {
        alert: extractEntity<AlertResource>(response),
      } satisfies AlertCreateResult;
    },
    getById: async (alertId: number | string) => {
      const response = await client.get<ApiSuccessResponse<AlertDetailsData>>(`/api/alerts/${alertId}`);
      return {
        details: extractEntity<AlertDetailsData>(response),
        alert: extractNestedEntity<AlertResource>(response, "alert"),
      };
    },
    deliveries: async (alertId: number | string) => {
      const response = await client.get<ApiSuccessResponse<DeliveryResource[]>>(`/api/alerts/${alertId}/deliveries`);
      return extractCollection<DeliveryResource>(response);
    },
    retry: async (alertId: number | string) => {
      const response = await client.post<unknown>(`/api/alerts/${alertId}/retry`);
      return response;
    },
  };
}
