import { defaultApiClient, type ApiClient } from "./httpClient";
import type {
  AlertsByTypeStatistics,
  AlertDetailsData,
  AlertPayload,
  AlertResource,
  ApiSuccessResponse,
  ApiKeyPayload,
  ApiKeyResource,
  AuthResponse,
  AuthUser,
  DailyStatistics,
  DashboardStatistics,
  DeliveryResource,
  DeliveryStatusPayload,
  DevicePayload,
  DeviceResource,
  HeartbeatPayload,
  HeartbeatResponse,
  LoginPayload,
  PaginationData,
  PlanResource,
  RegisterPayload,
  SettingsPayload,
  TagPayload,
  TagResource,
  TopDevicesStatistics,
  WebhookPayload,
  WebhookResource,
} from "./laravel-api.types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function extractData<T>(response: unknown): T {
  if (isRecord(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

function extractEntity<T>(response: unknown): T {
  return extractData<T>(response);
}

function extractCollection<T>(response: unknown): T[] {
  const data = extractData<unknown>(response);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as T[];
  }

  return [];
}

function extractNestedEntity<T>(response: unknown, key: string): T {
  const data = extractData<unknown>(response);

  if (isRecord(data) && key in data) {
    return data[key] as T;
  }

  return data as T;
}

function saveToken(client: ApiClient, token?: string) {
  if (token) {
    client.setAuthToken(token);
  }
}

function clearToken(client: ApiClient) {
  client.setAuthToken(null);
}

export interface AlertsListResult {
  items: AlertResource[];
  pagination?: PaginationData<AlertResource>;
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

export function useSanctumApi(client: ApiClient = defaultApiClient) {
  return {
    csrfCookie: () => client.get<unknown>("/sanctum/csrf-cookie"),
  };
}

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

export function useSettingsApi(client: ApiClient = defaultApiClient) {
  return {
    get: async () => {
      const response = await client.get<ApiSuccessResponse<SettingsPayload>>("/api/settings");
      return extractEntity<SettingsPayload>(response);
    },
    update: async (payload: SettingsPayload) => {
      const response = await client.put<ApiSuccessResponse<SettingsPayload> | SettingsPayload>("/api/settings", payload);
      return extractEntity<SettingsPayload>(response);
    },
  };
}

export function useDevicesApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<DeviceResource[]>>("/api/devices");
      return extractCollection<DeviceResource>(response);
    },
    create: async (payload: DevicePayload) => {
      const response = await client.post<ApiSuccessResponse<DeviceResource> | DeviceResource>("/api/devices", payload);
      return extractEntity<DeviceResource>(response);
    },
    getById: async (deviceId: number | string) => {
      const response = await client.get<ApiSuccessResponse<DeviceResource>>(`/api/devices/${deviceId}`);
      return extractEntity<DeviceResource>(response);
    },
    update: async (deviceId: number | string, payload: DevicePayload) => {
      const response = await client.put<ApiSuccessResponse<DeviceResource> | DeviceResource>(`/api/devices/${deviceId}`, payload);
      return extractEntity<DeviceResource>(response);
    },
    remove: (deviceId: number | string) => client.delete<unknown>(`/api/devices/${deviceId}`),
    heartbeat: async (deviceId: number | string, payload?: HeartbeatPayload) => {
      const response = await client.post<HeartbeatResponse>(`/api/devices/${deviceId}/heartbeat`, payload ?? {});
      return response;
    },
    regenerateToken: async (deviceId: number | string) => {
      const response = await client.post<unknown>(`/api/devices/${deviceId}/regenerate-token`);
      if (isRecord(response) && typeof response.token === "string") {
        return { token: response.token };
      }

      const data = extractData<UnknownRecord>(response);
      if (isRecord(data) && typeof data.token === "string") {
        return { token: data.token };
      }

      return {};
    },
  };
}

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

export function useAlertsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<PaginationData<AlertResource>> | ApiSuccessResponse<AlertResource[]>>("/api/alerts");
      return parseAlertsList(response);
    },
    create: async (payload: AlertPayload) => {
      const response = await client.post<ApiSuccessResponse<AlertResource> | AlertResource>("/api/alerts", payload);
      return extractEntity<AlertResource>(response);
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

export function useDeliveriesApi(client: ApiClient = defaultApiClient) {
  return {
    updateStatus: async (deliveryId: number | string, payload: DeliveryStatusPayload) => {
      const response = await client.patch<ApiSuccessResponse<DeliveryResource> | DeliveryResource>(`/api/deliveries/${deliveryId}/status`, payload);
      return extractEntity<DeliveryResource>(response);
    },
  };
}

export function useApiKeysApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<ApiKeyResource[]>>("/api/api-keys");
      return extractCollection<ApiKeyResource>(response);
    },
    create: async (payload: ApiKeyPayload) => {
      const response = await client.post<ApiSuccessResponse<ApiKeyResource> | ApiKeyResource>("/api/api-keys", payload);
      return extractEntity<ApiKeyResource>(response);
    },
    update: async (apiKeyId: number | string, payload: ApiKeyPayload) => {
      const response = await client.put<ApiSuccessResponse<ApiKeyResource> | ApiKeyResource>(`/api/api-keys/${apiKeyId}`, payload);
      return extractEntity<ApiKeyResource>(response);
    },
    remove: (apiKeyId: number | string) => client.delete<unknown>(`/api/api-keys/${apiKeyId}`),
  };
}

export function useWebhooksApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiSuccessResponse<WebhookResource[]>>("/api/webhooks");
      return extractCollection<WebhookResource>(response);
    },
    create: async (payload: WebhookPayload) => {
      const response = await client.post<ApiSuccessResponse<WebhookResource> | WebhookResource>("/api/webhooks", payload);
      return extractEntity<WebhookResource>(response);
    },
    getById: async (webhookId: number | string) => {
      const response = await client.get<ApiSuccessResponse<WebhookResource>>(`/api/webhooks/${webhookId}`);
      return extractEntity<WebhookResource>(response);
    },
    update: async (webhookId: number | string, payload: WebhookPayload) => {
      const response = await client.put<ApiSuccessResponse<WebhookResource> | WebhookResource>(`/api/webhooks/${webhookId}`, payload);
      return extractEntity<WebhookResource>(response);
    },
    remove: (webhookId: number | string) => client.delete<unknown>(`/api/webhooks/${webhookId}`),
    logs: async (webhookId: number | string) => {
      const response = await client.get<unknown>(`/api/webhooks/${webhookId}/logs`);
      return response;
    },
    test: async (webhookId: number | string) => {
      const response = await client.post<unknown>(`/api/webhooks/${webhookId}/test`);
      return response;
    },
  };
}

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

export function useLaravelApi(client: ApiClient = defaultApiClient) {
  return {
    sanctum: useSanctumApi(client),
    auth: useAuthApi(client),
    plans: usePlansApi(client),
    settings: useSettingsApi(client),
    devices: useDevicesApi(client),
    tags: useTagsApi(client),
    alerts: useAlertsApi(client),
    deliveries: useDeliveriesApi(client),
    apiKeys: useApiKeysApi(client),
    webhooks: useWebhooksApi(client),
    statistics: useStatisticsApi(client),
  };
}
