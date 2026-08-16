import { getToken, clearToken } from '../utils/storage';

// Configurable via EXPO_PUBLIC_API_URL (see .env.example). The default points
// at the deployed backend.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://cafe-phi-hazel.vercel.app/api';

// React Native's fetch has no default timeout — a request to an unreachable
// host can hang forever. Abort after this long so the UI can show an error.
const DEFAULT_TIMEOUT_MS = 15000;

export function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === 'AbortError'
  );
}

export async function clearAuthToken() {
  await clearToken();
}

// Called when any request comes back 401 so the app can return to login.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function onUnauthorized() {
  clearAuthToken();
  unauthorizedHandler?.();
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  const token = await getToken();

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    // Only set Content-Type for JSON bodies. For FormData (image uploads) the
    // multipart boundary must be generated automatically by the fetch layer;
    // forcing application/json breaks request.formData() on the server.
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetchWithTimeout(
    `${API_BASE_URL}${endpoint}`,
    { ...options, headers },
    timeoutMs
  );

  // Session expired or invalid — drop the stored token and notify the app so
  // it returns to the login screen instead of sitting on a dead dashboard.
  if (response.status === 401) {
    onUnauthorized();
  }

  return response;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'mobile',
        },
        body: JSON.stringify({ action: 'get-csrf' }),
      },
      DEFAULT_TIMEOUT_MS
    );

    if (response.ok) {
      const data = await response.json();
      return data.csrfToken || null;
    }
  } catch (error) {
    console.log('CSRF token fetch error', error);
  }
  return null;
}
