import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { fetchWithAuth, getCsrfToken } from '../services/api';
import { showAlert } from '../utils/notify';
import { showToast } from '../utils/toast';
import {
  getBiometricEnabled,
  setBiometricEnabled,
  getDisplayLanguage,
  setDisplayLanguage,
  DisplayLanguage,
} from '../utils/storage';
import { colors, PRESET_COLORS } from '../theme';

type Period = 'AM' | 'PM';

interface HourField {
  time: string;
  period: Period;
}

interface TimeRange {
  open: HourField;
  close: HourField;
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
  mapEmbed: string;
  aboutTitle: string;
  aboutDescription: string;
  specialName: string;
  specialPrice: string;
  specialDescription: string;
  language: DisplayLanguage;
}

// 24h ("08:00" / "22:00") -> 12h display ("8:00" AM / "10:00" PM)
const toHourField = (time24: string): HourField => {
  const [hPart, mPart] = time24.split(':');
  const hour = parseInt(hPart, 10);
  if (isNaN(hour)) return { time: time24 || '8:00', period: 'AM' };
  const minutes = mPart || '00';
  const period: Period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return { time: `${hour12}:${minutes}`, period };
};

// 12h display ("8:00" AM) -> 24h storage ("08:00")
const to24h = (field: HourField): string => {
  const [hPart, mPart] = field.time.split(':');
  let hour = parseInt(hPart, 10);
  if (isNaN(hour)) return '00:00';
  if (hour === 12) {
    hour = field.period === 'AM' ? 0 : 12;
  } else if (field.period === 'PM') {
    hour += 12;
  }
  const minutes = isNaN(parseInt(mPart, 10))
    ? '00'
    : String(parseInt(mPart, 10)).padStart(2, '0');
  return `${String(hour).padStart(2, '0')}:${minutes}`;
};

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
    weekdays: { open: { time: '8:00', period: 'AM' }, close: { time: '10:00', period: 'PM' } },
    saturday: { open: { time: '9:00', period: 'AM' }, close: { time: '11:00', period: 'PM' } },
    sunday: { open: { time: '9:00', period: 'AM' }, close: { time: '9:00', period: 'PM' } },
  },
  mapEmbed: '',
  aboutTitle: '',
  aboutDescription: '',
  specialName: '',
  specialPrice: '',
  specialDescription: '',
  language: 'en',
};

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
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
}) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, multiline && styles.multiline, secureTextEntry && styles.inputWithEye]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          autoCapitalize={secureTextEntry ? 'none' : undefined}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function HourInput({
  value,
  onChange,
}: {
  value: HourField;
  onChange: (v: HourField) => void;
}) {
  return (
    <View style={styles.hourInputGroup}>
      <TextInput
        style={[styles.input, styles.timeInput]}
        value={value.time}
        onChangeText={(time) => onChange({ ...value, time })}
        keyboardType="numeric"
        placeholder="8:00"
        placeholderTextColor={colors.muted}
        maxLength={5}
      />
      <View style={styles.periodToggle}>
        {(['AM', 'PM'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, value.period === p && styles.periodActive]}
            onPress={() => onChange({ ...value, period: p })}
          >
            <Text
              style={[
                styles.periodText,
                value.period === p && styles.periodTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const LANGUAGE_OPTIONS: { key: DisplayLanguage; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'am', label: 'አማርኛ' },
  { key: 'both', label: 'Both' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    loadDevicePreferences();
  }, []);

  const loadDevicePreferences = async () => {
    const [bio, lang] = await Promise.all([
      getBiometricEnabled(),
      getDisplayLanguage(),
    ]);
    setBiometricEnabledState(bio);
    setSettings((prev) => ({ ...prev, language: lang }));

    if (Platform.OS !== 'web') {
      try {
        const [hasHardware, enrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        setBiometricSupported(hasHardware && enrolled);
      } catch (e) {
        setBiometricSupported(false);
      }
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetchWithAuth('/cafe');
      if (res.ok) {
        const data = await res.json();
        const hours = data.openingHours as any;
        const toRange = (dayHours: any): TimeRange => ({
          open: toHourField(dayHours?.open || '08:00'),
          close: toHourField(dayHours?.close || '22:00'),
        });

        const openingHours: OpeningHours = hours?.monday
          ? {
              weekdays: toRange(hours.monday),
              saturday: toRange(hours.saturday),
              sunday: toRange(hours.sunday),
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
          mapEmbed: data.mapEmbed || '',
          aboutTitle: data.aboutTitle || '',
          aboutDescription: data.aboutDescription || '',
          specialName: special?.name || '',
          specialPrice: special?.price || '',
          specialDescription: special?.description || '',
          language: data.language === 'am' ? 'am' : data.language === 'both' ? 'both' : 'en',
        });
      }
    } catch (error) {
      showToast('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const updateHours = (
    day: keyof OpeningHours,
    field: 'open' | 'close',
    value: HourField
  ) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const changeLanguage = (lang: DisplayLanguage) => {
    update({ language: lang });
    setDisplayLanguage(lang);
  };

  const toggleBiometric = async (value: boolean) => {
    setBiometricEnabledState(value);
    await setBiometricEnabled(value);
    showToast(
      value ? 'Biometric unlock enabled' : 'Biometric unlock disabled',
      value ? 'success' : 'info'
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { weekdays, saturday, sunday } = settings.openingHours;
    const toDb = (range: TimeRange) => ({
      open: to24h(range.open),
      close: to24h(range.close),
    });
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
          language: settings.language,
          socialLinks: {
            instagram: settings.instagram,
            facebook: settings.facebook,
            twitter: settings.twitter,
          },
          openingHours: {
            monday: toDb(weekdays),
            tuesday: toDb(weekdays),
            wednesday: toDb(weekdays),
            thursday: toDb(weekdays),
            friday: toDb(weekdays),
            saturday: toDb(saturday),
            sunday: toDb(sunday),
          },
          mapEmbed: settings.mapEmbed,
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
        showToast('Settings saved successfully!');
      } else {
        const errorData = await res.json();
        const message =
          typeof errorData.error === 'string'
            ? errorData.error
            : 'Failed to save settings';
        showToast(message, 'error');
      }
    } catch (e) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Enter your current and new password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        showToast('Failed to initialize session. Please try again.', 'error');
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
        showToast('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Failed to change password', 'error');
      }
    } catch (e) {
      showToast('Failed to change password. Please try again.', 'error');
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
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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

        {sectionTitle('Opening Hours (12-hour)')}
        <View style={styles.card}>
          {(['weekdays', 'saturday', 'sunday'] as const).map((day) => (
            <View key={day} style={styles.dayRow}>
              <Text style={[styles.label, styles.dayLabel]}>
                {day === 'weekdays' ? 'Mon–Fri' : day === 'saturday' ? 'Saturday' : 'Sunday'}
              </Text>
              <View style={styles.hoursPair}>
                <HourInput
                  value={settings.openingHours[day].open}
                  onChange={(v) => updateHours(day, 'open', v)}
                />
                <Text style={styles.hoursTo}>to</Text>
                <HourInput
                  value={settings.openingHours[day].close}
                  onChange={(v) => updateHours(day, 'close', v)}
                />
              </View>
            </View>
          ))}
        </View>

        {sectionTitle('Map')}
        <View style={styles.card}>
          <Field
            label="Map Embed"
            value={settings.mapEmbed}
            onChangeText={(mapEmbed) => update({ mapEmbed })}
            placeholder="Paste the Google Maps embed code (<iframe>…)</iframe>"
            multiline
          />
          <Text style={styles.hint}>
            From Google Maps: Share → Embed a map → copy the code. It appears on your
            website's contact page.
          </Text>
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

        {sectionTitle('Display Language')}
        <View style={styles.card}>
          <Text style={styles.hint}>
            How menu items are shown in this app. Saved with your café settings.
          </Text>
          <View style={styles.languageRow}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.languageButton,
                  settings.language === opt.key && styles.languageActive,
                ]}
                onPress={() => changeLanguage(opt.key)}
              >
                <Text
                  style={[
                    styles.languageText,
                    settings.language === opt.key && styles.languageTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {sectionTitle('Security')}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <Text style={styles.switchTitle}>Unlock with Face ID / Fingerprint</Text>
              <Text style={styles.switchSubtitle}>
                {biometricSupported
                  ? 'Skip the password when opening the app'
                  : Platform.OS === 'web'
                    ? 'Not available in the browser'
                    : 'No biometrics set up on this device'}
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              disabled={!biometricSupported}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>
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
          <Text style={styles.hint}>
            Update your admin password. You'll use the new password next time you sign in.
          </Text>
          <Field label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" secureTextEntry />
          <Field label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Min 8 chars, upper, lower, number, special" secureTextEntry />
          <Field label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry />

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
    </KeyboardAvoidingView>
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
  inputWithEye: {
    paddingRight: 44,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
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
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dayLabel: {
    width: 72,
    marginTop: 12,
    marginBottom: 0,
  },
  hoursPair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  hourInputGroup: {
    flex: 1,
  },
  timeInput: {
    textAlign: 'center',
    paddingVertical: 10,
  },
  periodToggle: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    justifyContent: 'center',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  periodActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  periodText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  hoursTo: {
    color: colors.muted,
    marginTop: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  languageActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  languageText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  languageTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchBody: {
    flex: 1,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  switchSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
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
