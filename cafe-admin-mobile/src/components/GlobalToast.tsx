import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { setToastListener, ToastData } from '../utils/toast';
import { colors } from '../theme';

const DISMISS_MS = 3000;

export default function GlobalToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    setToastListener(setToast);
    return () => setToastListener(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View
        style={[
          styles.box,
          toast.type === 'error' ? styles.error : styles.success,
        ]}
      >
        <Text style={styles.text}>{toast.text}</Text>
      </View>
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
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
    maxWidth: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  success: {
    backgroundColor: '#14532d',
  },
  error: {
    backgroundColor: '#7f1d1d',
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
});
