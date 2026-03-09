import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  getAuthToken?: () => string | null | undefined;
  onUnauthorized?: (error: AxiosError) => void;
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: BodyInit | object | null;
  headers?: HeadersInit;
  asFormData?: boolean;
  signal?: AbortSignal;
}

export interface ApiClient {
  axios: AxiosInstance;
  setAuthToken: (token: string | null) => void;
  setUnauthorizedHandler: (handler?: (error: AxiosError) => void) => void;
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
  post: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
  put: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
  patch: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_BASE_URL = "http://localhost:8000";
const AUTH_TOKEN_STORAGE_KEY = "m2s.auth_token";

function readStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;

  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage write errors (private mode, quota exceeded, etc.).
  }
}

function resolveBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl) return customBaseUrl;

  const env = import.meta.env as ImportMetaEnv & {
    VITE_API_BASE_URL?: string;
  };

  return env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function toFormData(payload: object): FormData {
  const formData = new FormData();

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, String(item)));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

function headersToRecord(headers?: HeadersInit): Record<string, string> | undefined {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
}

export function createApiClient(config?: ApiClientConfig): ApiClient {
  const baseUrl = resolveBaseUrl(config?.baseUrl);
  let authToken: string | null = config?.getAuthToken?.() ?? readStoredAuthToken();
  let unauthorizedHandler = config?.onUnauthorized;

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: headersToRecord(config?.defaultHeaders),
  });

  axiosInstance.interceptors.request.use((requestConfig) => {
    requestConfig.headers = requestConfig.headers ?? {};
    requestConfig.headers.Accept = "application/json";
    requestConfig.headers["X-Requested-With"] = "XMLHttpRequest";

    if (authToken) {
      requestConfig.headers.Authorization = `Bearer ${authToken}`;
    }

    return requestConfig;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        unauthorizedHandler?.(error);
      }

      return Promise.reject(error);
    }
  );

  async function request<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    const method = options?.method ?? "GET";
    const headers = new Headers(options?.headers);

    let body: ApiRequestOptions["body"];
    const incomingBody = options?.body;

    if (incomingBody && !(incomingBody instanceof FormData) && typeof incomingBody === "object") {
      if (options?.asFormData) {
        body = toFormData(incomingBody);
      } else {
        body = incomingBody;
      }
    } else if (incomingBody) {
      body = incomingBody;
    }

    if (body instanceof FormData) {
      headers.delete("Content-Type");
    }

    try {
      const axiosConfig: AxiosRequestConfig = {
        url: normalizePath(path),
        method,
        data: body,
        headers: headersToRecord(headers),
        signal: options?.signal,
      };

      const response = await axiosInstance.request<T>(axiosConfig);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        const data = error.response?.data ?? null;
        throw new ApiError(`Request failed with status ${status}`, status, data);
      }

      throw error;
    }
  }

  return {
    axios: axiosInstance,
    setAuthToken: (token: string | null) => {
      authToken = token;
      persistAuthToken(token);
    },
    setUnauthorizedHandler: (handler?: (error: AxiosError) => void) => {
      unauthorizedHandler = handler;
    },
    request,
    get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "DELETE" }),
  };
}

export const defaultApiClient = createApiClient();
