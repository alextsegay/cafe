import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function BiometricGateScreen({
  onAuthenticated,
  onUsePassword,
}: {
  onAuthenticated: () => void;
  onUsePassword: () => void;
}) {
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !enrolled) {
        // No biometrics on this device (or web) — fall straight through.
        onAuthenticated();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Café Admin',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        onAuthenticated();
      } else {
        setError('Authentication was cancelled. Try again or use your password.');
      }
    } catch (e) {
      setError('Biometrics are not available right now. Use your password instead.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="finger-print" size={56} color={colors.accent} />
      </View>
      <Text style={styles.title}>Café Admin</Text>
      <Text style={styles.subtitle}>Unlock with your fingerprint or face</Text>

      {isChecking ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 32 }} />
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
            <Ionicons name="finger-print" size={22} color="#ffffff" />
            <Text style={styles.unlockText}>Unlock</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.passwordButton} onPress={onUsePassword}>
        <Text style={styles.passwordText}>Use password instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  error: {
    color: colors.redText,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 24,
  },
  unlockText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  passwordButton: {
    marginTop: 18,
    paddingVertical: 8,
  },
  passwordText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
