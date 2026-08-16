import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://cafe-phi-hazel.vercel.app/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.log('SecureStore read error', error);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Cookie: `auth_token=${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-csrf' }),
      credentials: 'include',
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
