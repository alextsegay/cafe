import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setToastListener, ToastData } from '../utils/toast';
import { colors } from '../theme';

const DISMISS_MS = 3200;

const iconFor: Record<ToastData['type'], keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export default function GlobalToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setToastListener(setToast);
    return () => setToastListener(null);
  }, []);

  useEffect(() => {
    if (!toast) return;

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, DISMISS_MS);

    return () => clearTimeout(t);
  }, [toast, progress]);

  if (!toast) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.box,
          toast.type === 'error' ? styles.error : toast.type === 'info' ? styles.info : styles.success,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Ionicons
          name={iconFor[toast.type]}
          size={26}
          color={toast.type === 'error' ? '#fca5a5' : toast.type === 'info' ? '#93c5fd' : '#86efac'}
        />
        <Text style={styles.text}>{toast.text}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: '85%',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  success: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  error: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  info: {
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
    flexShrink: 1,
  },
});
