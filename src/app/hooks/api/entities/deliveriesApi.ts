import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { DeliveryStatusPayload } from "../laravel-api.types";

export interface DeliveryStatusResult {
  success: boolean;
  message?: string;
}

export function useDeliveriesApi(client: ApiClient = defaultApiClient) {
  return {
    updateStatus: async (deliveryId: number | string, payload: DeliveryStatusPayload) => {
      const response = await client.patch<DeliveryStatusResult>(`/api/deliveries/${deliveryId}/status`, payload);
      return response;
    },
  };
}
