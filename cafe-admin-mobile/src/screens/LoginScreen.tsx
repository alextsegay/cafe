import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, getCsrfToken, isTimeoutError } from '../services/api';
import { setToken } from '../utils/storage';
import { showToast } from '../utils/toast';
import { registerPushToken } from '../utils/push';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Get CSRF token
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        showToast('Failed to initialize session. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Step 2: Send login request with CSRF token. React Native's fetch has no
      // timeout, so abort after 15s to avoid an infinite spinner on a slow or
      // hanging connection.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            // Tells the server this is a native client so it returns the JWT
            // in the response body (browser logins only get the httpOnly cookie).
            'x-client': 'mobile',
          },
          body: JSON.stringify({ action: 'login', email, password }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.user) {
        // Step 3: Store the JWT returned in the response body. React Native's
        // fetch does not expose Set-Cookie headers, so we cannot extract the
        // token from a cookie — the server returns it explicitly instead.
        const jwtToken = data.token;

        if (!jwtToken) {
          showToast('Server did not return an auth token. Please try again.', 'error');
          return;
        }

        const stored = await setToken(jwtToken);
        if (!stored) {
          showToast('Failed to save your session on this device.', 'error');
          return;
        }

        // Register this device for push notifications (contact alerts etc.).
        registerPushToken();
        onLoginSuccess();
      } else if (response.status === 429) {
        showToast(data.error || 'Too many attempts. Try again in a few minutes.', 'error');
      } else {
        showToast(data.error || 'Invalid email or password', 'error');
      }
    } catch (error) {
      if (isTimeoutError(error)) {
        showToast('Request timed out. Please check your connection.', 'error');
      } else {
        showToast('Network error. Please check your connection.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>☕ Café Admin</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your café menu</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@cafemenu.com"
              placeholderTextColor="#78716c"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#78716c"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#a8a29e"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1917',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#292524',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#44403c',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a8a29e',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d6d3d1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1c1917',
    borderWidth: 1,
    borderColor: '#44403c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#d97706',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
