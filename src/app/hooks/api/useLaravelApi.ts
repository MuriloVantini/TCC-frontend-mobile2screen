import { defaultApiClient, type ApiClient } from "./httpClient";
import type {
  AlertsByTypeStatistics,
  AlertPayload,
  AlertResource,
  ApiEnvelope,
  ApiKeyPayload,
  ApiKeyResource,
  AuthUser,
  DailyStatistics,
  DashboardStatistics,
  DeliveryResource,
  DeliveryStatusPayload,
  DevicePayload,
  DeviceResource,
  HeartbeatPayload,
  LoginPayload,
  PaginationEnvelope,
  PlanResource,
  RegisterPayload,
  SettingsPayload,
  TagPayload,
  TagResource,
  TopDevicesStatistics,
  WebhookPayload,
  WebhookResource,
} from "./laravel-api.types";

function unwrapData<T>(response: T | ApiEnvelope<T> | PaginationEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    const dataValue = (response as { data?: T }).data;
    if (dataValue !== undefined) {
      return dataValue;
    }
  }

  return response as T;
}

export function useSanctumApi(client: ApiClient = defaultApiClient) {
  return {
    csrfCookie: () => client.get<unknown>("/sanctum/csrf-cookie"),
  };
}

export function useAuthApi(client: ApiClient = defaultApiClient) {
  return {
    register: async (payload: RegisterPayload) => {
      const response = await client.post<ApiEnvelope<AuthUser>>("/api/register", payload, { asFormData: true });
      return unwrapData(response);
    },
    login: async (payload: LoginPayload) => {
      const response = await client.post<ApiEnvelope<AuthUser>>("/api/login", payload, { asFormData: true });
      return unwrapData(response);
    },
    user: async () => {
      const response = await client.get<ApiEnvelope<AuthUser>>("/api/user");
      return unwrapData(response);
    },
    logout: () => client.post<unknown>("/api/logout"),
  };
}

export function usePlansApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<PlanResource[] | ApiEnvelope<PlanResource[]> | PaginationEnvelope<PlanResource>>("/api/plans");
      return unwrapData(response) as PlanResource[];
    },
    getById: async (planId: number | string) => {
      const response = await client.get<PlanResource | ApiEnvelope<PlanResource>>(`/api/plans/${planId}`);
      return unwrapData(response);
    },
  };
}

export function useSettingsApi(client: ApiClient = defaultApiClient) {
  return {
    get: async () => {
      const response = await client.get<SettingsPayload | ApiEnvelope<SettingsPayload>>("/api/settings");
      return unwrapData(response);
    },
    update: async (payload: SettingsPayload) => {
      const response = await client.put<SettingsPayload | ApiEnvelope<SettingsPayload>>("/api/settings", payload);
      return unwrapData(response);
    },
  };
}

export function useDevicesApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<DeviceResource[] | ApiEnvelope<DeviceResource[]> | PaginationEnvelope<DeviceResource>>("/api/devices");
      return unwrapData(response) as DeviceResource[];
    },
    create: async (payload: DevicePayload) => {
      const response = await client.post<DeviceResource | ApiEnvelope<DeviceResource>>("/api/devices", payload);
      return unwrapData(response);
    },
    getById: async (deviceId: number | string) => {
      const response = await client.get<DeviceResource | ApiEnvelope<DeviceResource>>(`/api/devices/${deviceId}`);
      return unwrapData(response);
    },
    update: async (deviceId: number | string, payload: DevicePayload) => {
      const response = await client.put<DeviceResource | ApiEnvelope<DeviceResource>>(`/api/devices/${deviceId}`, payload);
      return unwrapData(response);
    },
    remove: (deviceId: number | string) => client.delete<unknown>(`/api/devices/${deviceId}`),
    heartbeat: async (deviceId: number | string, payload?: HeartbeatPayload) => {
      const response = await client.post<DeviceResource | ApiEnvelope<DeviceResource>>(`/api/devices/${deviceId}/heartbeat`, payload ?? {});
      return unwrapData(response);
    },
    regenerateToken: async (deviceId: number | string) => {
      const response = await client.post<ApiEnvelope<{ token: string }> | { token: string }>(`/api/devices/${deviceId}/regenerate-token`);
      return unwrapData(response);
    },
  };
}

export function useTagsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<TagResource[] | ApiEnvelope<TagResource[]> | PaginationEnvelope<TagResource>>("/api/tags");
      return unwrapData(response) as TagResource[];
    },
    create: async (payload: TagPayload) => {
      const response = await client.post<TagResource | ApiEnvelope<TagResource>>("/api/tags", payload);
      return unwrapData(response);
    },
    getById: async (tagId: number | string) => {
      const response = await client.get<TagResource | ApiEnvelope<TagResource>>(`/api/tags/${tagId}`);
      return unwrapData(response);
    },
    update: async (tagId: number | string, payload: TagPayload) => {
      const response = await client.put<TagResource | ApiEnvelope<TagResource>>(`/api/tags/${tagId}`, payload);
      return unwrapData(response);
    },
    remove: (tagId: number | string) => client.delete<unknown>(`/api/tags/${tagId}`),
    devices: async (tagId: number | string) => {
      const response = await client.get<DeviceResource[] | ApiEnvelope<DeviceResource[]> | PaginationEnvelope<DeviceResource>>(`/api/tags/${tagId}/devices`);
      return unwrapData(response) as DeviceResource[];
    },
  };
}

export function useAlertsApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<AlertResource[] | ApiEnvelope<AlertResource[]> | PaginationEnvelope<AlertResource>>("/api/alerts");
      return unwrapData(response) as AlertResource[];
    },
    create: async (payload: AlertPayload) => {
      const response = await client.post<AlertResource | ApiEnvelope<AlertResource>>("/api/alerts", payload);
      return unwrapData(response);
    },
    getById: async (alertId: number | string) => {
      const response = await client.get<AlertResource | ApiEnvelope<AlertResource>>(`/api/alerts/${alertId}`);
      return unwrapData(response);
    },
    deliveries: async (alertId: number | string) => {
      const response = await client.get<DeliveryResource[] | ApiEnvelope<DeliveryResource[]> | PaginationEnvelope<DeliveryResource>>(`/api/alerts/${alertId}/deliveries`);
      return unwrapData(response) as DeliveryResource[];
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
      const response = await client.patch<DeliveryResource | ApiEnvelope<DeliveryResource>>(`/api/deliveries/${deliveryId}/status`, payload);
      return unwrapData(response);
    },
  };
}

export function useApiKeysApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<ApiKeyResource[] | ApiEnvelope<ApiKeyResource[]> | PaginationEnvelope<ApiKeyResource>>("/api/api-keys");
      return unwrapData(response) as ApiKeyResource[];
    },
    create: async (payload: ApiKeyPayload) => {
      const response = await client.post<ApiKeyResource | ApiEnvelope<ApiKeyResource>>("/api/api-keys", payload);
      return unwrapData(response);
    },
    update: async (apiKeyId: number | string, payload: ApiKeyPayload) => {
      const response = await client.put<ApiKeyResource | ApiEnvelope<ApiKeyResource>>(`/api/api-keys/${apiKeyId}`, payload);
      return unwrapData(response);
    },
    remove: (apiKeyId: number | string) => client.delete<unknown>(`/api/api-keys/${apiKeyId}`),
  };
}

export function useWebhooksApi(client: ApiClient = defaultApiClient) {
  return {
    list: async () => {
      const response = await client.get<WebhookResource[] | ApiEnvelope<WebhookResource[]> | PaginationEnvelope<WebhookResource>>("/api/webhooks");
      return unwrapData(response) as WebhookResource[];
    },
    create: async (payload: WebhookPayload) => {
      const response = await client.post<WebhookResource | ApiEnvelope<WebhookResource>>("/api/webhooks", payload);
      return unwrapData(response);
    },
    getById: async (webhookId: number | string) => {
      const response = await client.get<WebhookResource | ApiEnvelope<WebhookResource>>(`/api/webhooks/${webhookId}`);
      return unwrapData(response);
    },
    update: async (webhookId: number | string, payload: WebhookPayload) => {
      const response = await client.put<WebhookResource | ApiEnvelope<WebhookResource>>(`/api/webhooks/${webhookId}`, payload);
      return unwrapData(response);
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
      const response = await client.get<DashboardStatistics | ApiEnvelope<DashboardStatistics>>("/api/statistics/dashboard");
      return unwrapData(response);
    },
    daily: async () => {
      const response = await client.get<DailyStatistics | ApiEnvelope<DailyStatistics>>("/api/statistics/daily");
      return unwrapData(response);
    },
    alertsByType: async () => {
      const response = await client.get<AlertsByTypeStatistics | ApiEnvelope<AlertsByTypeStatistics>>("/api/statistics/alerts-by-type");
      return unwrapData(response);
    },
    topDevices: async () => {
      const response = await client.get<TopDevicesStatistics | ApiEnvelope<TopDevicesStatistics>>("/api/statistics/top-devices");
      return unwrapData(response);
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
