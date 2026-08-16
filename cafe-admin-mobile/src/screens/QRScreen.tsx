import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithAuth, API_BASE_URL } from '../services/api';
import { showAlert } from '../utils/notify';
import { colors } from '../theme';

export default function QRScreen() {
  const [menuUrl, setMenuUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <QRCode value={menuUrl} size={220} />
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

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.shareButtonText}>Share Menu Link</Text>
        </TouchableOpacity>
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
  shareButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
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
