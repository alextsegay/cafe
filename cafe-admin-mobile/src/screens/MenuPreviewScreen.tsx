import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { fetchWithAuth, API_BASE_URL } from '../services/api';
import { showToast } from '../utils/toast';
import { colors } from '../theme';

interface MenuItem {
  id: string;
  name: string;
  nameAm?: string | null;
  description?: string | null;
  descriptionAm?: string | null;
  price: number;
  image?: string | null;
  popular?: boolean;
  isNew?: boolean;
  available: boolean;
  category: { id: string; name: string; nameAm?: string | null; order: number };
}

interface CategoryGroup {
  id: string;
  name: string;
  nameAm?: string | null;
  order: number;
  items: MenuItem[];
}

export default function MenuPreviewScreen() {
  const [cafeName, setCafeName] = useState('Café');
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [cafeRes, menuRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cafe`),
        fetchWithAuth('/menu'),
      ]);

      if (cafeRes.ok) {
        const cafe = await cafeRes.json();
        setCafeName(cafe.name || 'Café');
      }

      if (menuRes.ok) {
        const items: MenuItem[] = await menuRes.json();
        const map = new Map<string, CategoryGroup>();
        for (const item of items) {
          const cat = item.category;
          const existing = map.get(cat.id);
          if (existing) {
            existing.items.push(item);
          } else {
            map.set(cat.id, {
              id: cat.id,
              name: cat.name,
              nameAm: cat.nameAm,
              order: cat.order,
              items: [item],
            });
          }
        }
        const sorted = [...map.values()].sort((a, b) => a.order - b.order);
        setGroups(sorted);
      }
    } catch (e) {
      showToast('Failed to load the menu preview', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.cafeName}>{cafeName}</Text>
        <Text style={styles.cafeTagline}>Our menu</Text>
      </View>

      {groups.map((group) => (
        <View key={group.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.name}</Text>
          {group.items.map((item) => (
            <View key={item.id} style={[styles.item, !item.available && styles.itemUnavailable]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : null}
              <View style={styles.itemBody}>
                <View style={styles.itemNameRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.popular ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Popular</Text>
                    </View>
                  ) : null}
                  {item.isNew ? (
                    <View style={[styles.badge, styles.newBadge]}>
                      <Text style={styles.badgeText}>New</Text>
                    </View>
                  ) : null}
                </View>
                {item.nameAm ? (
                  <Text style={styles.itemNameAm}>{item.nameAm}</Text>
                ) : null}
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString()} ETB
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {groups.length === 0 ? (
        <Text style={styles.empty}>No menu items yet.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: colors.card,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  cafeName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  cafeTagline: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 10,
  },
  itemUnavailable: {
    opacity: 0.45,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.inputBg,
  },
  itemBody: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  itemNameAm: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#78350f',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadge: {
    backgroundColor: '#14532d',
  },
  badgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },
  itemDescription: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  itemPrice: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
