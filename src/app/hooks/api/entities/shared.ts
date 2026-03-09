export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function extractData<T>(response: unknown): T {
  if (isRecord(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

export function extractEntity<T>(response: unknown): T {
  return extractData<T>(response);
}

export function extractCollection<T>(response: unknown): T[] {
  const data = extractData<unknown>(response);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as T[];
  }

  return [];
}

export function extractNestedEntity<T>(response: unknown, key: string): T {
  const data = extractData<unknown>(response);

  if (isRecord(data) && key in data) {
    return data[key] as T;
  }

  return data as T;
}

export function saveToken(client: { setAuthToken: (token: string | null) => void }, token?: string) {
  if (token) {
    client.setAuthToken(token);
  }
}

export function clearToken(client: { setAuthToken: (token: string | null) => void }) {
  client.setAuthToken(null);
}
