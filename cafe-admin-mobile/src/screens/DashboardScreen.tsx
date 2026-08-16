import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export default function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/menu`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch menu data');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setPrice(item.price.toString());
      setImage(item.image || '');
      setAvailable(item.available);
      setSelectedCategory(item.categoryId);
    } else {
      setEditingItem(null);
      setName('');
      setPrice('');
      setImage('');
      setAvailable(true);
      setSelectedCategory(categories[0]?.id || '');
    }
    setModalVisible(true);
  };

  const pickImageFromPhone = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access photos is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          setImage(uploadData.url);
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Upload Error', 'Failed to upload image');
        }
      } catch (e) {
        Alert.alert('Error', 'Error uploading image');
      }
    }
  };

  const handleSaveItem = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    setIsSaving(true);
    const url = editingItem ? `${API_BASE_URL}/menu/${editingItem.id}` : `${API_BASE_URL}/menu`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          image,
          available,
          categoryId: selectedCategory || categories[0]?.id,
        }),
      });

      if (res.ok) {
        setModalVisible(false);
        fetchData();
      } else {
        const errorData = await res.json();
        Alert.alert('Save Failed', JSON.stringify(errorData.error));
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred saving item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this menu item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE' });
            if (res.ok) {
              fetchData();
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Café Management</Text>
          <Text style={styles.headerSubtitle}>{items.length} Menu Items</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await SecureStore.deleteItemAsync('userToken');
            onLogout();
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Add */}
      <View style={styles.controlsRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#78716c"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Item List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
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
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    { color: item.available ? '#22c55e' : '#ef4444' },
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
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Cappuccino"
                placeholderTextColor="#78716c"
              />

              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.modalInput}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 4.50"
                keyboardType="numeric"
                placeholderTextColor="#78716c"
              />

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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1917',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a8a29e',
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#292524',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#44403c',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#292524',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#44403c',
  },
  addButton: {
    backgroundColor: '#d97706',
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
    backgroundColor: '#292524',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#44403c',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#44403c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemPrice: {
    fontSize: 14,
    color: '#d97706',
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
    backgroundColor: '#44403c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fca5a5',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#292524',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#d6d3d1',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#1c1917',
    borderWidth: 1,
    borderColor: '#44403c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
  },
  uploadBox: {
    backgroundColor: '#1c1917',
    borderWidth: 1,
    borderColor: '#d97706',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadText: {
    color: '#d97706',
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
    marginVertical: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#44403c',
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
    backgroundColor: '#d97706',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
