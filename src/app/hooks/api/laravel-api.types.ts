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
  company?: string | null;
  phone?: string | null;
  profile_image_url?: string | null;
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
  company?: string;
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
  name: string;
  url: string;
  secret?: string;
  events: string[];
  is_active: boolean;
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
  url?: string;
  has_secret?: boolean;
  events?: ApiPrimitive[];
  is_active?: boolean;
  last_triggered?: string | null;
  logs_count?: number;
}

export interface WebhookLogResource extends ApiRecord {
  id?: number;
  webhook_id?: number;
  event_type?: string;
  response_status?: number | null;
  response_body?: string | null;
  error_message?: string | null;
  created_at?: string;
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
  profile_image_url?: string | null;
}

export interface AlertDetailsData extends ApiRecord {
  alert: AlertResource;
  stats?: ApiRecord;
}

export interface DashboardStatistics extends ApiRecord {}
export interface AdminDashboardUsers extends ApiRecord {
  total?: number;
  active?: number;
  suspended?: number;
  new_today?: number;
}
export interface AdminDashboardDevices extends ApiRecord {
  total?: number;
  online?: number;
  offline?: number;
  online_percentage?: number;
}
export interface AdminDashboardAlerts extends ApiRecord {
  today?: number;
  last_30_days?: number;
}
export interface AdminDashboardDeliveries extends ApiRecord {
  total?: number;
  delivered?: number;
  failed?: number;
  pending?: number;
  delivery_rate?: number;
}
export interface AdminDashboardDaily extends ApiRecord {
  date?: string;
  alerts_sent?: number;
  alerts_delivered?: number;
  alerts_failed?: number;
  delivery_rate?: number;
}
export interface AdminDashboardTopUser extends ApiRecord {
  id?: number;
  name?: string;
  email?: string;
  company?: string | null;
  devices_count?: number;
  alerts_count?: number;
  delivery_rate?: number;
}
export interface AdminDashboardStatistics extends ApiRecord {
  generated_at?: string;
  users?: AdminDashboardUsers;
  devices?: AdminDashboardDevices;
  alerts?: AdminDashboardAlerts;
  deliveries?: AdminDashboardDeliveries;
  daily?: AdminDashboardDaily[];
  alerts_by_type?: AlertsByTypeStatistics[];
  top_users?: AdminDashboardTopUser[];
}
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
