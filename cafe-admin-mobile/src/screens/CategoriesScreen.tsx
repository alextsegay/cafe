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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithAuth } from '../services/api';
import { showAlert } from '../utils/notify';
import { showToast } from '../utils/toast';
import { colors } from '../theme';

interface Category {
  id: string;
  name: string;
  order: number;
  itemCount: number;
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const res = await fetchWithAuth('/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            order: c.order,
            itemCount: c._count?.menuItems ?? 0,
          }))
        );
      }
    } catch (error) {
      showAlert('Error', 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const openModal = (category?: Category) => {
    setEditingCategory(category || null);
    setName(category?.name || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetchWithAuth(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        setModalVisible(false);
        fetchCategories();
        showToast(editingCategory ? 'Category updated' : 'Category added');
      } else {
        const errorData = await res.json();
        showAlert('Save Failed', errorData.error || 'Failed to save category');
      }
    } catch (e) {
      showAlert('Error', 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.itemCount > 0) {
      showAlert(
        'Category in use',
        `"${category.name}" has ${category.itemCount} menu item(s). Deleting it will remove those items. Continue?`
      );
      return;
    }
    showAlert('Confirm Delete', `Delete category "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`/categories/${category.id}`, { method: 'DELETE' });
            if (res.ok) {
              fetchCategories();
              showToast('Category deleted');
            } else {
              const errorData = await res.json();
              showAlert('Error', errorData.error || 'Failed to delete category');
            }
          } catch (e) {
            showAlert('Error', 'Failed to delete category');
          }
        },
      },
    ]);
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;

    const current = categories[index];
    const neighbor = categories[target];
    const updated = [...categories];
    updated[index] = neighbor;
    updated[target] = current;
    setCategories(updated);

    try {
      await Promise.all([
        fetchWithAuth(`/categories/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: neighbor.order }),
        }),
        fetchWithAuth(`/categories/${neighbor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);
    } catch (e) {
      showAlert('Error', 'Failed to reorder categories');
      fetchCategories();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerHint}>{categories.length} categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : categories.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>No categories yet</Text>
          <Text style={styles.emptyHint}>Add a category to organize your menu</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchCategories();
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item, index }) => (
            <View style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>
                  {item.itemCount} item{item.itemCount === 1 ? '' : 's'}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: index === 0 ? 0.3 : 1 }]}
                  disabled={index === 0}
                  onPress={() => handleReorder(index, -1)}
                >
                  <Ionicons name="chevron-up" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: index === categories.length - 1 ? 0.3 : 1 }]}
                  disabled={index === categories.length - 1}
                  onPress={() => handleReorder(index, 1)}
                >
                  <Ionicons name="chevron-down" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.redText} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Coffee"
              placeholderTextColor={colors.muted}
              autoFocus
            />

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
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerHint: {
    color: colors.muted,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  categoryCount: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    backgroundColor: colors.cardBorder,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    marginTop: 12,
  },
  emptyHint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
