import { defaultApiClient, type ApiClient } from "../config/httpClient";
import type { ApiSuccessResponse, DeliveryResource, DeliveryStatusPayload } from "../laravel-api.types";
import { extractEntity } from "./shared";

export function useDeliveriesApi(client: ApiClient = defaultApiClient) {
  return {
    updateStatus: async (deliveryId: number | string, payload: DeliveryStatusPayload) => {
      const response = await client.patch<ApiSuccessResponse<DeliveryResource> | DeliveryResource>(
        `/api/deliveries/${deliveryId}/status`,
        payload
      );
      return extractEntity<DeliveryResource>(response);
    },
  };
}
