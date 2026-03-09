import { defaultApiClient, type ApiClient } from "./config/httpClient";
import {
  useAlertsApi,
  useApiKeysApi,
  useAuthApi,
  useDeliveriesApi,
  useDevicesApi,
  usePlansApi,
  useSanctumApi,
  useSettingsApi,
  useStatisticsApi,
  useTagsApi,
  useUsersApi,
  useWebhooksApi,
} from "./entities";

export {
  useAlertsApi,
  type AlertsListResult,
  useApiKeysApi,
  useAuthApi,
  useDeliveriesApi,
  useDevicesApi,
  usePlansApi,
  useSanctumApi,
  useSettingsApi,
  useStatisticsApi,
  useTagsApi,
  useUsersApi,
  useWebhooksApi,
} from "./entities";

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
    users: useUsersApi(client),
  };
}
