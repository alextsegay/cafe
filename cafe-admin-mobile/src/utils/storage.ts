import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';
const BIOMETRIC_KEY = 'biometricEnabled';
const LANGUAGE_KEY = 'displayLanguage';

export type DisplayLanguage = 'en' | 'am' | 'both';

const isWeb = Platform.OS === 'web';

export async function getToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return typeof localStorage !== 'undefined'
        ? localStorage.getItem(TOKEN_KEY)
        : null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.log('getToken error', error);
    return null;
  }
}

export async function setToken(token: string): Promise<boolean> {
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      }
      return true;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.log('setToken error', error);
    return false;
  }
}

async function readString(key: string): Promise<string | null> {
  try {
    if (isWeb) {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log('readString error', error);
    return null;
  }
}

async function writeString(key: string, value: string): Promise<void> {
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log('writeString error', error);
  }
}

export async function getBiometricEnabled(): Promise<boolean> {
  const value = await readString(BIOMETRIC_KEY);
  return value === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await writeString(BIOMETRIC_KEY, enabled ? 'true' : 'false');
}

export async function getDisplayLanguage(): Promise<DisplayLanguage> {
  const value = await readString(LANGUAGE_KEY);
  return value === 'am' || value === 'both' ? value : 'en';
}

export async function setDisplayLanguage(language: DisplayLanguage): Promise<void> {
  await writeString(LANGUAGE_KEY, language);
}

export async function clearToken(): Promise<void> {
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.log('clearToken error', error);
  }
}
