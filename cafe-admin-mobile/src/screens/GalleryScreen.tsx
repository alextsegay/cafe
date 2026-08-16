import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { fetchWithAuth } from '../services/api';
import { showAlert } from '../utils/notify';
import { colors } from '../theme';

interface GalleryImage {
  id: string;
  image: string;
  order: number;
}

export default function GalleryScreen() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const res = await fetchWithAuth('/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      showAlert('Error', 'Failed to fetch gallery');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const addImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('Permission Denied', 'Permission to access photos is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setIsUploading(true);
    try {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', { uri: localUri, name: filename, type } as any);

      const uploadRes = await fetchWithAuth('/upload', {
        method: 'POST',
        body: formData,
      }, 60000);

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        showAlert('Upload Error', errorData.error || 'Failed to upload image');
        return;
      }

      const uploadData = await uploadRes.json();

      const createRes = await fetchWithAuth('/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadData.url }),
      });

      if (createRes.ok) {
        fetchGallery();
      } else {
        const errorData = await createRes.json();
        showAlert('Error', errorData.error || 'Failed to add image to gallery');
      }
    } catch (e) {
      showAlert('Error', 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (image: GalleryImage) => {
    showAlert('Confirm Delete', 'Remove this image from the gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`/gallery/${image.id}`, { method: 'DELETE' });
            if (res.ok) {
              setImages(images.filter((i) => i.id !== image.id));
            } else {
              const errorData = await res.json();
              showAlert('Error', errorData.error || 'Failed to delete image');
            }
          } catch (e) {
            showAlert('Error', 'Failed to delete image');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerHint}>{images.length} image{images.length === 1 ? '' : 's'}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.addButtonText}>+ Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="images-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>No gallery images yet</Text>
          <Text style={styles.emptyHint}>Tap "+ Add" to upload photos from your device</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchGallery();
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.imageCard}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteBadge}
                onPress={() => deleteImage(item)}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
    minWidth: 76,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  imageCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    textAlign: 'center',
  },
});
