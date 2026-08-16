import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithAuth, API_BASE_URL } from '../services/api';
import { showAlert } from '../utils/notify';
import { showToast } from '../utils/toast';
import { colors } from '../theme';

export default function QRScreen() {
  const [menuUrl, setMenuUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    fetchCafe();
  }, []);

  const fetchCafe = async () => {
    try {
      const res = await fetchWithAuth('/cafe');
      if (res.ok) {
        const data = await res.json();
        const slug = data.slug || 'cafe';
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        setMenuUrl(`${baseUrl}/menu/${slug}`);
      }
    } catch (error) {
      showAlert('Error', 'Failed to load café settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!menuUrl) return;
    try {
      await Share.share({
        message: `Scan to view our digital menu: ${menuUrl}`,
      });
    } catch (error) {
      // user cancelled — ignore
    }
  };

  const downloadQR = () => {
    if (!qrRef.current?.toDataURL) {
      showAlert('Error', 'QR code is not ready yet');
      return;
    }

    setIsDownloading(true);
    qrRef.current.toDataURL(async (base64: string) => {
      try {
        if (Platform.OS === 'web') {
          // Browser: trigger a download via a data URL link.
          const link = document.createElement('a');
          link.href = `data:image/png;base64,${base64}`;
          link.download = 'cafe-menu-qr.png';
          link.click();
          showToast('QR code downloaded');
          return;
        }

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permission Denied', 'Permission to save photos is required');
          return;
        }

        const fileUri = (FileSystem.cacheDirectory || '') + 'cafe-menu-qr.png';
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.createAssetAsync(fileUri);
        showToast('QR code saved to your photos');
      } catch (e) {
        showAlert('Error', 'Failed to save QR code');
      } finally {
        setIsDownloading(false);
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.qrCard}>
        {menuUrl ? (
          <View style={styles.qrBox}>
            <QRCode
              value={menuUrl}
              size={220}
              getRef={(c) => {
                qrRef.current = c;
              }}
            />
          </View>
        ) : (
          <View style={[styles.qrBox, styles.qrPlaceholder]}>
            <Ionicons name="qr-code-outline" size={80} color={colors.muted} />
          </View>
        )}

        <Text style={styles.hint}>
          Customers scan this code to open your digital menu.
        </Text>

        <View style={styles.urlBox}>
          <Text style={styles.urlText} numberOfLines={2}>
            {menuUrl}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={downloadQR}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Download QR</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Share Link
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Print Tips</Text>
        <Text style={styles.tip}>• Print at 300 DPI for best results</Text>
        <Text style={styles.tip}>• Recommended minimum size: 2" x 2" (5cm x 5cm)</Text>
        <Text style={styles.tip}>• Use high-contrast white paper</Text>
        <Text style={styles.tip}>• Place QR codes in well-lit areas</Text>
        <Text style={styles.tip}>• Test the QR code with your phone before printing</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  qrBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  urlBox: {
    marginTop: 12,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  urlText: {
    color: colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: colors.cardBorder,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tipsTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  tip: {
    color: colors.muted,
    fontSize: 13,
    marginVertical: 3,
  },
});
