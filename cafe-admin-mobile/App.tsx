import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { fetchWithAuth, clearAuthToken } from './src/services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync('authToken');
    } catch {
      token = null;
    }

    // No stored token — show login.
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // Verify the token is still valid against the server. An explicit 401
    // means the session expired — clear it and return to login. Network or
    // server errors keep the user logged in optimistically rather than
    // locking them out while offline.
    try {
      const response = await fetchWithAuth('/auth/me');
      if (response.ok) {
        setIsLoggedIn(true);
      } else if (response.status === 401) {
        await clearAuthToken();
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch {
      setIsLoggedIn(true);
    }
  };

  if (isLoggedIn === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d97706" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {isLoggedIn ? (
          <DashboardScreen onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1917',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1c1917',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
