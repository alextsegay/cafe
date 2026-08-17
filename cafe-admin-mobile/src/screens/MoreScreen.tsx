import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { clearToken } from '../utils/storage';
import { colors } from '../theme';

type MoreStackParamList = {
  MoreHome: undefined;
  Settings: undefined;
  QRCode: undefined;
  Notifications: undefined;
  Contact: undefined;
  MenuPreview: undefined;
  BankAccounts: undefined;
};

interface Row {
  key: keyof Omit<MoreStackParamList, 'MoreHome'>;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const rows: Row[] = [
  { key: 'Settings', title: 'Settings', subtitle: 'Café info, branding, hours, password', icon: 'settings-outline', color: colors.accent },
  { key: 'QRCode', title: 'QR Code', subtitle: 'Digital menu QR for your customers', icon: 'qr-code-outline', color: '#a855f7' },
  { key: 'MenuPreview', title: 'Preview Menu', subtitle: 'See the menu like your customers do', icon: 'eye-outline', color: '#f59e0b' },
  { key: 'BankAccounts', title: 'Bank Accounts', subtitle: 'Payment accounts for your Pay page', icon: 'card-outline', color: '#14b8a6' },
  { key: 'Notifications', title: 'Notifications', subtitle: 'Alerts and updates', icon: 'notifications-outline', color: '#3b82f6' },
  { key: 'Contact', title: 'Contact Messages', subtitle: 'Messages from your contact form', icon: 'mail-outline', color: '#22c55e' },
];

export default function MoreScreen({ onLogout }: { onLogout: () => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

  const handleLogout = async () => {
    await clearToken();
    onLogout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {rows.map((row) => (
        <TouchableOpacity
          key={row.key}
          style={styles.row}
          onPress={() => navigation.navigate(row.key)}
        >
          <View style={[styles.rowIcon, { backgroundColor: row.color + '22' }]}>
            <Ionicons name={row.icon} size={22} color={row.color} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Café Admin Mobile v1.0.0</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  rowSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logoutText: {
    color: colors.red,
    fontWeight: '700',
    fontSize: 16,
  },
  version: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
