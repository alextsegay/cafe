import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://cafe-phi-hazel.vercel.app/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync('userToken');
  } catch (error) {
    console.log('SecureStore read error', error);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Cookie: `token=${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
