import * as SecureStore from 'expo-secure-store';

// Configurable via EXPO_PUBLIC_API_URL (see .env.example). The default points
// at the deployed backend.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://cafe-phi-hazel.vercel.app/api';

export async function clearAuthToken() {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.log('SecureStore delete error', error);
  }
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.log('SecureStore read error', error);
  }

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Session expired or invalid — drop the stored token so the app returns to
  // the login screen instead of sitting on a dead dashboard.
  if (response.status === 401) {
    clearAuthToken();
  }

  return response;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-csrf' }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.csrfToken || null;
    }
  } catch (error) {
    console.log('CSRF token fetch error', error);
  }
  return null;
}
