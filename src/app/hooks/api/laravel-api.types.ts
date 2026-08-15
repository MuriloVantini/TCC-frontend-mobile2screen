export type ApiPrimitive = string | number | boolean | null;

export interface ApiRecord {
  [key: string]: ApiPrimitive | ApiPrimitive[] | ApiRecord | ApiRecord[] | null | undefined;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationData<T> {
  data: T[];
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  [key: string]: unknown;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ValidateResetPinPayload {
  email: string;
  pin_code: string;
}

export interface ResetPasswordPayload {
  email: string;
  pin_code: string;
  password: string;
  password_confirmation: string;
}

export interface SettingsPayload {
  [key: string]: unknown;
}

export interface DevicePayload {
  [key: string]: unknown;
}

export interface TagPayload {
  name: string;
  color?: string | null;
  [key: string]: unknown;
}

export interface AlertPayload {
  [key: string]: unknown;
}

export interface DeliveryStatusPayload {
  status: string;
  [key: string]: unknown;
}

export interface ApiKeyPayload {
  [key: string]: unknown;
}

export interface WebhookPayload {
  [key: string]: unknown;
}

export interface UserPayload {
  [key: string]: unknown;
}

export interface HeartbeatPayload {
  [key: string]: unknown;
}

export interface HeartbeatResponse {
  message: string;
}

export interface DeviceResource extends ApiRecord {
  id?: number;
  name?: string;
}

export interface TagResource extends ApiRecord {
  id?: number;
  name?: string;
  color?: string | null;
  devices_count?: number;
  alerts_count?: number;
}

export interface AlertResource extends ApiRecord {
  id?: number;
  title?: string;
  devices_count?: number;
  received_devices_count?: number;
  failed_devices_count?: number;
  pending_devices_count?: number;
}

export interface PlanResource extends ApiRecord {
  id?: number;
  name?: string;
}

export interface ApiKeyResource extends ApiRecord {
  id?: number;
  name?: string;
}

export interface WebhookResource extends ApiRecord {
  id?: number;
  name?: string;
}

export interface DeliveryResource extends ApiRecord {
  id?: number;
  status?: string;
}

export interface UserResource extends ApiRecord {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
}

export interface AlertDetailsData extends ApiRecord {
  alert: AlertResource;
  stats?: ApiRecord;
}

export interface DashboardStatistics extends ApiRecord {}
export interface DailyStatistics extends ApiRecord {
  date?: string;
  alerts_sent?: number;
  alerts_delivered?: number;
  alerts_failed?: number;
  devices_online_avg?: string;
  delivery_rate?: string;
}
export interface AlertsByTypeStatistics extends ApiRecord {
  type?: string;
  count?: number;
}
export interface TopDevicesStatistics extends ApiRecord {
  id?: number;
  name?: string;
  type?: string;
  location?: string;
  total_alerts?: number;
}
