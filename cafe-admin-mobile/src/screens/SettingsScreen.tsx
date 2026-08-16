import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { fetchWithAuth, getCsrfToken } from '../services/api';
import { showAlert } from '../utils/notify';
import { colors, PRESET_COLORS } from '../theme';

interface TimeRange {
  open: string;
  close: string;
}

interface OpeningHours {
  weekdays: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

interface Settings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  instagram: string;
  facebook: string;
  twitter: string;
  openingHours: OpeningHours;
  aboutTitle: string;
  aboutDescription: string;
  specialName: string;
  specialPrice: string;
  specialDescription: string;
}

const defaultSettings: Settings = {
  name: '',
  tagline: '',
  address: '',
  phone: '',
  email: '',
  primaryColor: '#C9A962',
  secondaryColor: '#3D2914',
  instagram: '',
  facebook: '',
  twitter: '',
  openingHours: {
    weekdays: { open: '08:00', close: '22:00' },
    saturday: { open: '09:00', close: '23:00' },
    sunday: { open: '09:00', close: '21:00' },
  },
  aboutTitle: '',
  aboutDescription: '',
  specialName: '',
  specialPrice: '',
  specialDescription: '',
};

interface Toast {
  text: string;
  type: 'success' | 'error';
}

const sectionTitle = (title: string) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchSettings = async () => {
    try {
      const res = await fetchWithAuth('/cafe');
      if (res.ok) {
        const data = await res.json();
        const hours = data.openingHours as any;
        const openingHours = hours?.monday
          ? {
              weekdays: {
                open: hours.monday?.open || defaultSettings.openingHours.weekdays.open,
                close: hours.monday?.close || defaultSettings.openingHours.weekdays.close,
              },
              saturday: {
                open: hours.saturday?.open || defaultSettings.openingHours.saturday.open,
                close: hours.saturday?.close || defaultSettings.openingHours.saturday.close,
              },
              sunday: {
                open: hours.sunday?.open || defaultSettings.openingHours.sunday.open,
                close: hours.sunday?.close || defaultSettings.openingHours.sunday.close,
              },
            }
          : (hours as OpeningHours) || defaultSettings.openingHours;

        const social = data.socialLinks as any;
        const special = data.dailySpecial as any;

        setSettings({
          name: data.name || '',
          tagline: data.tagline || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          primaryColor: data.primaryColor || defaultSettings.primaryColor,
          secondaryColor: data.secondaryColor || defaultSettings.secondaryColor,
          instagram: social?.instagram || '',
          facebook: social?.facebook || '',
          twitter: social?.twitter || '',
          openingHours,
          aboutTitle: data.aboutTitle || '',
          aboutDescription: data.aboutDescription || '',
          specialName: special?.name || '',
          specialPrice: special?.price || '',
          specialDescription: special?.description || '',
        });
      }
    } catch (error) {
      showAlert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const updateHours = (day: keyof OpeningHours, field: 'open' | 'close', value: string) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToast(null);
    const { weekdays, saturday, sunday } = settings.openingHours;
    try {
      const res = await fetchWithAuth('/cafe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          tagline: settings.tagline,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          socialLinks: {
            instagram: settings.instagram,
            facebook: settings.facebook,
            twitter: settings.twitter,
          },
          openingHours: {
            monday: weekdays,
            tuesday: weekdays,
            wednesday: weekdays,
            thursday: weekdays,
            friday: weekdays,
            saturday,
            sunday,
          },
          aboutTitle: settings.aboutTitle,
          aboutDescription: settings.aboutDescription,
          dailySpecial: {
            name: settings.specialName,
            price: settings.specialPrice,
            description: settings.specialDescription,
          },
          dailySpecialUpdatedAt: settings.specialName
            ? new Date().toISOString()
            : null,
        }),
      });

      if (res.ok) {
        setToast({ text: 'Settings saved successfully!', type: 'success' });
      } else {
        const errorData = await res.json();
        const message =
          typeof errorData.error === 'string'
            ? errorData.error
            : 'Failed to save settings';
        setToast({ text: message, type: 'error' });
      }
    } catch (e) {
      setToast({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showAlert('Error', 'Enter your current and new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        showAlert('Error', 'Failed to initialize session. Please try again.');
        return;
      }

      const res = await fetchWithAuth('/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showAlert('Success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showAlert('Error', data.error || 'Failed to change password');
      }
    } catch (e) {
      showAlert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
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
    <View style={styles.wrapper}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sectionTitle('Basic Info')}
      <View style={styles.card}>
        <Field label="Café Name" value={settings.name} onChangeText={(name) => update({ name })} />
        <Field label="Tagline" value={settings.tagline} onChangeText={(tagline) => update({ tagline })} />
      </View>

      {sectionTitle('Contact Info')}
      <View style={styles.card}>
        <Field label="Address" value={settings.address} onChangeText={(address) => update({ address })} />
        <Field label="Phone" value={settings.phone} onChangeText={(phone) => update({ phone })} keyboardType="phone-pad" />
        <Field label="Email" value={settings.email} onChangeText={(email) => update({ email })} keyboardType="email-address" />
      </View>

      {sectionTitle('Branding Colors')}
      <View style={styles.card}>
        <Text style={styles.label}>Primary Color</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: settings.primaryColor }]} />
          <TextInput
            style={[styles.input, styles.colorInput]}
            value={settings.primaryColor}
            onChangeText={(primaryColor) => update({ primaryColor })}
            placeholder="#C9A962"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.presets}>
          {PRESET_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.presetDot,
                { backgroundColor: c },
                settings.primaryColor === c && styles.presetActive,
              ]}
              onPress={() => update({ primaryColor: c })}
            />
          ))}
        </View>

        <Text style={styles.label}>Secondary Color</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: settings.secondaryColor }]} />
          <TextInput
            style={[styles.input, styles.colorInput]}
            value={settings.secondaryColor}
            onChangeText={(secondaryColor) => update({ secondaryColor })}
            placeholder="#3D2914"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.presets}>
          {PRESET_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.presetDot,
                { backgroundColor: c },
                settings.secondaryColor === c && styles.presetActive,
              ]}
              onPress={() => update({ secondaryColor: c })}
            />
          ))}
        </View>
      </View>

      {sectionTitle('Social Links')}
      <View style={styles.card}>
        <Field label="Instagram" value={settings.instagram} onChangeText={(instagram) => update({ instagram })} placeholder="https://instagram.com/..." />
        <Field label="Facebook" value={settings.facebook} onChangeText={(facebook) => update({ facebook })} placeholder="https://facebook.com/..." />
        <Field label="Twitter / X" value={settings.twitter} onChangeText={(twitter) => update({ twitter })} placeholder="https://twitter.com/..." />
      </View>

      {sectionTitle('Opening Hours')}
      <View style={styles.card}>
        {(['weekdays', 'saturday', 'sunday'] as const).map((day) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={[styles.label, styles.hoursLabel]}>
              {day === 'weekdays' ? 'Mon–Fri' : day === 'saturday' ? 'Saturday' : 'Sunday'}
            </Text>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={settings.openingHours[day].open}
              onChangeText={(v) => updateHours(day, 'open', v)}
              placeholder="08:00"
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.hoursTo}>to</Text>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={settings.openingHours[day].close}
              onChangeText={(v) => updateHours(day, 'close', v)}
              placeholder="22:00"
              placeholderTextColor={colors.muted}
            />
          </View>
        ))}
      </View>

      {sectionTitle('Daily Special')}
      <View style={styles.card}>
        <Field label="Special Name" value={settings.specialName} onChangeText={(specialName) => update({ specialName })} placeholder="Today's Special" />
        <Field label="Price" value={settings.specialPrice} onChangeText={(specialPrice) => update({ specialPrice })} keyboardType="numeric" />
        <Field label="Description" value={settings.specialDescription} onChangeText={(specialDescription) => update({ specialDescription })} multiline />
      </View>

      {sectionTitle('About Section')}
      <View style={styles.card}>
        <Field label="About Title" value={settings.aboutTitle} onChangeText={(aboutTitle) => update({ aboutTitle })} placeholder="Our Story" />
        <Field label="About Description" value={settings.aboutDescription} onChangeText={(aboutDescription) => update({ aboutDescription })} multiline />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>

      {sectionTitle('Change Password')}
      <View style={styles.card}>
        <Text style={styles.passwordHint}>
          Update your admin password. You'll use the new password next time you sign in.
        </Text>
        <Field label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" />
        <Field label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Min 8 chars, upper, lower, number, special" />
        <Field label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" />

        <TouchableOpacity
          style={[styles.changePasswordButton, isChangingPassword && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changePasswordText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>

    {toast ? (
      <View style={styles.toastOverlay} pointerEvents="none">
        <View
          style={[
            styles.toastBox,
            toast.type === 'error' ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Text style={styles.toastText}>{toast.text}</Text>
        </View>
      </View>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  toastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  toastBox: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  toastSuccess: {
    backgroundColor: '#14532d',
  },
  toastError: {
    backgroundColor: '#7f1d1d',
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: colors.label,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  colorInput: {
    flex: 1,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetActive: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  hoursLabel: {
    width: 70,
    marginBottom: 0,
  },
  timeInput: {
    flex: 1,
    textAlign: 'center',
  },
  hoursTo: {
    color: colors.muted,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  passwordHint: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  changePasswordButton: {
    backgroundColor: colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
