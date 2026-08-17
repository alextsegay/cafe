import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import BiometricGateScreen from './src/screens/BiometricGateScreen';
import GlobalToast from './src/components/GlobalToast';
import { fetchWithAuth, setUnauthorizedHandler, isTimeoutError } from './src/services/api';
import { getToken, clearToken, getBiometricEnabled } from './src/utils/storage';
import { registerPushToken, initPushTapHandling } from './src/utils/push';

// Log the admin out after they've been away from the app for this long.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [needsBiometric, setNeedsBiometric] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Any 401 from the API (expired/invalid token) sends the user back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      handleLogout();
    });
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tapping a push notification navigates to the right screen.
  useEffect(() => {
    initPushTapHandling();
  }, []);

  // Auto-logout: if the app was backgrounded for more than 5 minutes, sign out.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current !== null) {
        const elapsed = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (elapsed >= IDLE_TIMEOUT_MS) {
          handleLogout();
        }
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register this device for push notifications while logged in.
  useEffect(() => {
    if (isLoggedIn) {
      registerPushToken();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await clearToken();
    setNeedsBiometric(false);
    setIsLoggedIn(false);
  };

  const checkLoginStatus = async () => {
    const token = await getToken();

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
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      if (isTimeoutError(error)) {
        console.log('Session check timed out; keeping user logged in.');
      }
      setIsLoggedIn(true);
    }

    // If biometric unlock is enabled, show the gate before the app.
    if ((await getBiometricEnabled()) && isLoggedIn !== false) {
      setNeedsBiometric(true);
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
      {isLoggedIn ? (
        needsBiometric ? (
          <BiometricGateScreen
            onAuthenticated={() => setNeedsBiometric(false)}
            onUsePassword={() => handleLogout()}
          />
        ) : (
          <AppNavigator onLogout={() => handleLogout()} />
        )
      ) : (
        <LoginScreen
          onLoginSuccess={() => {
            setNeedsBiometric(false);
            setIsLoggedIn(true);
          }}
        />
      )}
      <GlobalToast />
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
