import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, getCsrfToken } from '../services/api';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Get CSRF token
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        Alert.alert('Error', 'Failed to initialize session. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 2: Send login request with CSRF token
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ action: 'login', email, password }),
        credentials: 'include',
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.user) {
        // Step 3: Store the JWT returned in the response body. React Native's
        // fetch does not expose Set-Cookie headers, so we cannot extract the
        // token from a cookie — the server returns it explicitly instead.
        const jwtToken = data.token;

        if (!jwtToken) {
          Alert.alert('Error', 'Server did not return an auth token. Please try again.');
          return;
        }

        await SecureStore.setItemAsync('authToken', jwtToken);

        onLoginSuccess();
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1917',
    justifyContent: 'center',
    padding: 24,
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
