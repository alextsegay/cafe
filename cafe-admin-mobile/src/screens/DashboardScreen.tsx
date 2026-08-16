import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithAuth } from '../services/api';
import { showAlert } from '../utils/notify';
import { colors, CURRENCY } from '../theme';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  categoryName?: string;
  createdAt?: string;
}

interface Stats {
  menuItems: number;
  categories: number;
  hiddenItems: number;
  galleryImages: number;
}

export default function DashboardScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    menuItems: 0,
    categories: 0,
    hiddenItems: 0,
    galleryImages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, catRes, galleryRes] = await Promise.all([
        fetchWithAuth('/menu'),
        fetchWithAuth('/categories'),
        fetchWithAuth('/gallery'),
      ]);

      let menuItems: MenuItem[] = [];
      let categoryNames: Record<string, string> = {};
      let galleryCount = 0;

      if (menuRes.ok) {
        const data = await menuRes.json();
        menuItems = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          available: item.available,
          categoryName: item.category?.name || '',
          createdAt: item.createdAt,
        }));
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        categoryNames = Object.fromEntries(catData.map((c: any) => [c.id, c.name]));
      }
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        galleryCount = Array.isArray(galleryData) ? galleryData.length : 0;
      }

      setItems(menuItems);
      setStats({
        menuItems: menuItems.length,
        categories: Object.keys(categoryNames).length,
        hiddenItems: menuItems.filter((i) => !i.available).length,
        galleryImages: galleryCount,
      });
    } catch (error) {
      showAlert('Error', 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recentItems = [...items]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);

  const statCards = [
    { title: 'Menu Items', value: stats.menuItems, icon: 'restaurant' as const, color: colors.accent, key: 'menu' },
    { title: 'Categories', value: stats.categories, icon: 'folder' as const, color: '#22c55e', key: 'cat' },
    { title: 'Hidden Items', value: stats.hiddenItems, icon: 'eye-off' as const, color: '#a8a29e', key: 'hidden' },
    { title: 'Gallery Images', value: stats.galleryImages, icon: 'images' as const, color: '#a855f7', key: 'gallery' },
  ];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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
    >
      <Text style={styles.subtitle}>Welcome back! Here's an overview of your café.</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Items */}
      <Text style={styles.sectionTitle}>Recent Menu Items</Text>
      {recentItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="restaurant-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>No menu items yet</Text>
          <Text style={styles.emptyHint}>Add your first item in the Menu tab</Text>
        </View>
      ) : (
        recentItems.map((item) => (
          <View key={item.id} style={styles.recentCard}>
            <View style={styles.recentIcon}>
              <Ionicons name="restaurant-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.recentDetails}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentCategory}>{item.categoryName}</Text>
            </View>
            <View style={styles.recentRight}>
              <Text style={styles.recentPrice}>
                {CURRENCY} {item.price.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.recentStatus,
                  { color: item.available ? colors.green : colors.red },
                ]}
              >
                {item.available ? 'Available' : 'Hidden'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statTitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  recentName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  recentCategory: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentPrice: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  recentStatus: {
    fontSize: 11,
    marginTop: 2,
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
});
