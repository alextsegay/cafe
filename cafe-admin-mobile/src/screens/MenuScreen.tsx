import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { fetchWithAuth } from '../services/api';
import { showAlert } from '../utils/notify';
import { showToast } from '../utils/toast';
import { getDisplayLanguage, DisplayLanguage } from '../utils/storage';
import { colors, CURRENCY } from '../theme';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  nameAm?: string;
  description?: string;
  descriptionAm?: string;
  ingredients?: string;
  ingredientsAm?: string;
  price: number;
  image: string | null;
  available: boolean;
  popular: boolean;
  isNew: boolean;
  categoryId: string;
}

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [ingredientsAm, setIngredientsAm] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [popular, setPopular] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState<DisplayLanguage>('en');

  useEffect(() => {
    fetchData();
  }, []);

  // Re-read the display language whenever this screen regains focus
  // (e.g. after changing it in Settings).
  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      getDisplayLanguage().then((lang) => {
        if (active) setLanguage(lang);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const displayName = (item: MenuItem) => {
    if (language === 'am') return item.nameAm || item.name;
    if (language === 'both' && item.nameAm) return `${item.name} / ${item.nameAm}`;
    return item.name;
  };

  const fetchData = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([
        fetchWithAuth('/menu'),
        fetchWithAuth('/categories'),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        // Backend returns items with nested category object; map to flat shape
        const mappedItems: MenuItem[] = itemsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          nameAm: item.nameAm || '',
          description: item.description || '',
          descriptionAm: item.descriptionAm || '',
          ingredients: item.ingredients || '',
          ingredientsAm: item.ingredientsAm || '',
          price: item.price,
          image: item.image,
          available: item.available,
          popular: item.popular,
          isNew: item.isNew,
          categoryId: item.category?.id || item.categoryId || '',
        }));
        setItems(mappedItems);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (error) {
      showToast('Failed to fetch menu data', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setNameAm(item.nameAm || '');
      setDescription(item.description || '');
      setDescriptionAm(item.descriptionAm || '');
      setIngredients(item.ingredients || '');
      setIngredientsAm(item.ingredientsAm || '');
      setPrice(item.price.toString());
      setImage(item.image || '');
      setAvailable(item.available);
      setPopular(item.popular);
      setIsNew(item.isNew);
      setSelectedCategory(item.categoryId);
    } else {
      setEditingItem(null);
      setName('');
      setNameAm('');
      setDescription('');
      setDescriptionAm('');
      setIngredients('');
      setIngredientsAm('');
      setPrice('');
      setImage('');
      setAvailable(true);
      setPopular(false);
      setIsNew(false);
      setSelectedCategory(categories[0]?.id || '');
    }
    setModalVisible(true);
  };

  const pickImageFromPhone = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showToast('Permission to access photos is required', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', { uri: localUri, name: filename, type } as any);

      try {
        const uploadRes = await fetchWithAuth('/upload', {
          method: 'POST',
          body: formData,
        }, 60000);

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          setImage(uploadData.url);
          showToast('Image uploaded successfully!');
        } else {
          const errorData = await uploadRes.json();
          showToast(errorData.error || 'Failed to upload image', 'error');
        }
      } catch (e) {
        showToast('Error uploading image', 'error');
      }
    }
  };

  const handleSaveItem = async () => {
    if (!name || !price) {
      showToast('Name and price are required', 'error');
      return;
    }
    if (!selectedCategory) {
      showToast('Please select a category', 'error');
      return;
    }

    setIsSaving(true);
    const endpoint = editingItem ? `/menu/${editingItem.id}` : '/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameAm: nameAm || undefined,
          description: description || undefined,
          descriptionAm: descriptionAm || undefined,
          ingredients: ingredients || undefined,
          ingredientsAm: ingredientsAm || undefined,
          price: parseFloat(price),
          image,
          available,
          popular,
          isNew,
          categoryId: selectedCategory,
        }),
      });

      if (res.ok) {
        setModalVisible(false);
        fetchData();
        showToast(editingItem ? 'Menu item updated' : 'Menu item added');
      } else {
        const errorData = await res.json();
        showToast(
          typeof errorData.error === 'string'
            ? errorData.error
            : 'Failed to save item',
          'error'
        );
      }
    } catch (e) {
      showToast('An error occurred saving item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    showAlert('Confirm Delete', 'Are you sure you want to delete this menu item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`/menu/${id}`, { method: 'DELETE' });
            if (res.ok) {
              fetchData();
              showToast('Menu item deleted');
            } else {
              const errorData = await res.json();
              showToast(errorData.error || 'Failed to delete item', 'error');
            }
          } catch (e) {
            showToast('Failed to delete item', 'error');
          }
        },
      },
    ]);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.nameAm || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search & Add */}
      <View style={styles.controlsRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Item List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Text style={{ fontSize: 24 }}>☕</Text>
                </View>
              )}

              <View style={styles.itemDetails}>
                <View style={styles.badgeRow}>
                  {item.popular ? (
                    <View style={[styles.badge, styles.badgePopular]}>
                      <Text style={styles.badgeText}>Popular</Text>
                    </View>
                  ) : null}
                  {item.isNew ? (
                    <View style={[styles.badge, styles.badgeNew]}>
                      <Text style={styles.badgeText}>New</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.itemName}>{displayName(item)}</Text>
                <Text style={styles.itemPrice}>
                  {CURRENCY} {item.price.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.statusBadge,
                    { color: item.available ? colors.green : colors.red },
                  ]}
                >
                  {item.available ? '● Available' : '○ Unavailable'}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </Text>

              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Cappuccino"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Name (Amharic)</Text>
              <TextInput
                style={styles.modalInput}
                value={nameAm}
                onChangeText={setNameAm}
                placeholder="e.g. ካፑቺኖ"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this item..."
                placeholderTextColor={colors.muted}
                multiline
              />

              <Text style={styles.label}>Description (Amharic)</Text>
              <TextInput
                style={[styles.modalInput, styles.multiline]}
                value={descriptionAm}
                onChangeText={setDescriptionAm}
                placeholder="መግለጫ..."
                placeholderTextColor={colors.muted}
                multiline
              />

              <Text style={styles.label}>Ingredients</Text>
              <TextInput
                style={[styles.modalInput, styles.multiline]}
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="e.g. Espresso, steamed milk, foam"
                placeholderTextColor={colors.muted}
                multiline
              />

              <Text style={styles.label}>Ingredients (Amharic)</Text>
              <TextInput
                style={[styles.modalInput, styles.multiline]}
                value={ingredientsAm}
                onChangeText={setIngredientsAm}
                placeholder="ንጥረ ነገሮች..."
                placeholderTextColor={colors.muted}
                multiline
              />

              <Text style={styles.label}>Price ({CURRENCY}) *</Text>
              <TextInput
                style={styles.modalInput}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 4.50"
                keyboardType="numeric"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Category *</Text>
              {categories.length > 0 ? (
                <View style={styles.categoryRow}>
                  {categories.map((cat) => {
                    const selected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          selected && styles.categoryChipSelected,
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selected && styles.categoryChipTextSelected,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyCategoriesText}>
                  No categories found. Add one in the Categories tab first.
                </Text>
              )}

              <Text style={styles.label}>Image</Text>
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickImageFromPhone}
              >
                <Text style={styles.uploadText}>
                  📷 Pick Photo from Camera/Gallery
                </Text>
              </TouchableOpacity>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : null}

              <View style={styles.switchRow}>
                <Text style={styles.label}>Available</Text>
                <Switch value={available} onValueChange={setAvailable} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Popular</Text>
                <Switch value={popular} onValueChange={setPopular} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>New</Text>
                <Switch value={isNew} onValueChange={setIsNew} />
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
                  onPress={handleSaveItem}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Item</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
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
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 3,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgePopular: {
    backgroundColor: '#7c2d12',
  },
  badgeNew: {
    backgroundColor: '#14532d',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: colors.redBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: colors.redText,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.label,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChipText: {
    color: colors.label,
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyCategoriesText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  uploadBox: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadText: {
    color: colors.accent,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.cardBorder,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
