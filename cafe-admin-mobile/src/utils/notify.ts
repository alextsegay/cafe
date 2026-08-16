import { Alert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';

/**
 * react-native-web stubs Alert.alert as a no-op, so all feedback silently
 * disappears when running in a browser. This helper routes to the native
 * Alert on devices and to window.alert / window.confirm on web.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;

    if (buttons && buttons.length > 0) {
      const confirmButton = buttons.find((b) => b.style !== 'cancel');
      const cancelButton = buttons.find((b) => b.style === 'cancel');
      const text = message || title;
      if (window.confirm(text)) {
        confirmButton?.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    } else {
      window.alert(message || title);
    }
    return;
  }

  Alert.alert(title, message, buttons);
}
