import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { fetchWithAuth, API_BASE_URL } from '../services/api';
import { showToast } from '../utils/toast';
import { ETHIOPIAN_BANKS, getBankLogo } from '../utils/ethiopianBanks';
import { colors } from '../theme';

const ASSET_BASE = API_BASE_URL.replace(/\/api$/, '');

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImage?: string | null;
  visible: boolean;
  order: number;
}

export default function BankAccountsScreen() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [visible, setVisible] = useState(true);

  const fetchAccounts = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const res = await fetchWithAuth('/bank-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(
          [...data].sort((a: BankAccount, b: BankAccount) => a.order - b.order)
        );
      }
    } catch (e) {
      showToast('Failed to load bank accounts', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openModal = (account?: BankAccount) => {
    if (account) {
      setEditing(account);
      setBankName(account.bankName);
      setAccountName(account.accountName);
      setAccountNumber(account.accountNumber);
      setQrImage(account.qrImage || '');
      setVisible(account.visible);
    } else {
      setEditing(null);
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setQrImage('');
      setVisible(true);
    }
    setModalVisible(true);
  };

  const pickAndUploadImage = async (
    setter: (url: string) => void,
    busy: (v: boolean) => void,
    label: string
  ) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showToast('Permission to access photos is required', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      const formData = new FormData();
      formData.append('file', { uri: localUri, name: filename, type } as any);

      busy(true);
      try {
        const uploadRes = await fetchWithAuth('/upload', {
          method: 'POST',
          body: formData,
        }, 60000);

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          setter(uploadData.url);
          showToast(`${label} uploaded`);
        } else {
          const errorData = await uploadRes.json();
          showToast(errorData.error || `Failed to upload ${label.toLowerCase()}`, 'error');
        }
      } catch (e) {
        showToast(`Failed to upload ${label.toLowerCase()}`, 'error');
      } finally {
        busy(false);
      }
    }
  };

  const pickQrImage = () => pickAndUploadImage(setQrImage, setIsUploadingQr, 'QR image');

  const handleSave = async () => {
    if (!bankName || !accountName || !accountNumber) {
      showToast('Bank, account name and number are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        bankName,
        accountName,
        accountNumber,
        qrImage: qrImage || null,
        visible,
      };
      const endpoint = editing ? `/bank-accounts/${editing.id}` : '/bank-accounts';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetchWithAuth(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalVisible(false);
        fetchAccounts();
        showToast(editing ? 'Bank account updated' : 'Bank account added');
      } else {
        const errorData = await res.json();
        showToast(
          typeof errorData.error === 'string' ? errorData.error : 'Failed to save',
          'error'
        );
      }
    } catch (e) {
      showToast('Failed to save bank account', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisible = async (account: BankAccount) => {
    const next = !account.visible;
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, visible: next } : a))
    );
    const res = await fetchWithAuth(`/bank-accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: next }),
    });
    if (!res.ok) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, visible: !next } : a))
      );
      showToast('Failed to update visibility', 'error');
    } else {
      showToast(next ? 'Account shown on Pay page' : 'Account hidden', 'info');
    }
  };

  const handleDelete = (account: BankAccount) => {
    require('../utils/notify').showAlert(
      'Confirm Delete',
      `Delete the ${account.bankName} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/bank-accounts/${account.id}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                fetchAccounts();
                showToast('Bank account deleted');
              } else {
                showToast('Failed to delete bank account', 'error');
              }
            } catch (e) {
              showToast('Failed to delete bank account', 'error');
            }
          },
        },
      ]
    );
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= accounts.length) return;
    const next = [...accounts];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setAccounts(next);
    await Promise.all(
      next.map((a, i) =>
        fetchWithAuth(`/bank-accounts/${a.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        }).catch(() => null)
      )
    );
  };

  const copyNumber = async (account: BankAccount) => {
    await Clipboard.setStringAsync(account.accountNumber);
    showToast('Account number copied');
  };

  const renderItem = ({ item, index }: { item: BankAccount; index: number }) => {
    return (
      <View style={[styles.card, !item.visible && styles.cardHidden]}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: ASSET_BASE + getBankLogo(item.bankName) }}
            style={styles.bankIcon}
          />
          <View style={styles.cardTitleBlock}>
            <View style={styles.bankNameRow}>
              <Text style={styles.bankName}>{item.bankName}</Text>
              {!item.visible ? (
                <View style={styles.hiddenBadge}>
                  <Ionicons name="eye-off-outline" size={12} color={colors.muted} />
                  <Text style={styles.hiddenBadgeText}>Hidden</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.accountHolder}>{item.accountName}</Text>
            <View style={styles.numberRow}>
              <Text style={styles.accountNumber}>{item.accountNumber}</Text>
              <TouchableOpacity
                onPress={() => copyNumber(item)}
                style={styles.copyButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.qrImage ? (
            <Image source={{ uri: item.qrImage }} style={styles.qrImage} />
          ) : (
            <View style={[styles.qrImage, styles.qrPlaceholder]}>
              <Ionicons name="qr-code-outline" size={28} color={colors.muted} />
              <Text style={styles.qrPlaceholderText}>No QR</Text>
            </View>
          )}
          <View style={styles.cardActions}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {item.visible ? 'Visible' : 'Hidden'}
              </Text>
              <Switch
                value={item.visible}
                onValueChange={() => toggleVisible(item)}
                trackColor={{ false: colors.cardBorder, true: colors.accent }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.actionButtons}>
              <View style={styles.reorderGroup}>
                <TouchableOpacity
                  disabled={index === 0}
                  onPress={() => move(index, -1)}
                  style={[styles.iconButton, { opacity: index === 0 ? 0.3 : 1 }]}
                >
                  <Ionicons name="chevron-up" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={index === accounts.length - 1}
                  onPress={() => move(index, 1)}
                  style={[styles.iconButton, { opacity: index === accounts.length - 1 ? 0.3 : 1 }]}
                >
                  <Ionicons name="chevron-down" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={16} color={colors.redText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const selectedBankIsPreset = ETHIOPIAN_BANKS.some((b) => b.name === bankName);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerHint}>
          Accounts shown on the public Pay page. Toggle each bank to show or hide it.
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAccounts();
              }}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No bank accounts yet. Tap Add to create one.</Text>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit Bank Account' : 'Add Bank Account'}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Bank</Text>
              <View style={styles.bankChips}>
                {ETHIOPIAN_BANKS.map((bank) => {
                  const selected = bankName === bank.name;
                  return (
                    <TouchableOpacity
                      key={bank.name}
                      style={[styles.bankChip, selected && styles.bankChipActive]}
                      onPress={() => setBankName(bank.name)}
                    >
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                      ) : (
                        <View style={[styles.chipDot, { backgroundColor: bank.color }]} />
                      )}
                      <Text
                        style={[styles.bankChipText, selected && styles.bankChipTextActive]}
                        numberOfLines={1}
                      >
                        {bank.short}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.bankChip, !selectedBankIsPreset && bankName ? styles.bankChipActive : null]}
                  onPress={() => setBankName('')}
                >
                  <Ionicons name="create-outline" size={14} color={colors.muted} />
                  <Text style={styles.bankChipText}>Custom</Text>
                </TouchableOpacity>
              </View>

              {selectedBankIsPreset ? (
                <View style={styles.selectedBankRow}>
                  <Image
                    source={{ uri: ASSET_BASE + getBankLogo(bankName) }}
                    style={styles.selectedBankLogo}
                  />
                  <Text style={styles.selectedBankName}>{bankName}</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Type bank name (e.g. Telebirr)"
                  placeholderTextColor={colors.muted}
                />
              )}

              <Text style={styles.label}>Account Name</Text>
              <TextInput
                style={styles.input}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Name on the account"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="e.g. 1000134567890"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Payment QR Image</Text>
              <View style={styles.qrUploadRow}>
                {qrImage ? (
                  <Image source={{ uri: qrImage }} style={styles.qrPreview} />
                ) : (
                  <View style={[styles.qrPreview, styles.qrPlaceholder]}>
                    <Ionicons name="qr-code-outline" size={30} color={colors.muted} />
                    <Text style={styles.qrPlaceholderText}>No QR yet</Text>
                  </View>
                )}
                <View style={styles.qrUploadButtons}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickQrImage}
                    disabled={isUploadingQr}
                  >
                    {isUploadingQr ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Ionicons name="image-outline" size={18} color="#fff" />
                    )}
                    <Text style={styles.uploadButtonText}>
                      {isUploadingQr ? 'Uploading…' : 'Upload QR'}
                    </Text>
                  </TouchableOpacity>
                  {qrImage ? (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setQrImage('')}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.redText} />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {visible ? 'Visible on Pay page' : 'Hidden'}
                </Text>
                <Switch
                  value={visible}
                  onValueChange={setVisible}
                  trackColor={{ false: colors.cardBorder, true: colors.accent }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editing ? 'Update' : 'Add'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerHint: {
    color: colors.muted,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  cardHidden: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  bankName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  hiddenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hiddenBadgeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  accountHolder: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  accountNumber: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '600',
  },
  copyButton: {
    padding: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  qrImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  qrPlaceholder: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  qrPlaceholderText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reorderGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  label: {
    color: colors.label,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
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
  bankChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bankChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bankChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 110,
  },
  bankChipTextActive: {
    color: '#ffffff',
  },
  selectedBankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedBankLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  selectedBankName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  qrUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrPreview: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  qrUploadButtons: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
  },
  removeButtonText: {
    color: colors.redText,
    fontWeight: '600',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
