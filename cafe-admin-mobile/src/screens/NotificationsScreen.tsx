import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithAuth } from '../services/api';
import { showAlert } from '../utils/notify';
import { colors } from '../theme';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#22c55e',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const res = await fetchWithAuth('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      showAlert('Error', 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      showAlert('Error', 'Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetchWithAuth('/notifications/mark-all-read', {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      showAlert('Error', 'Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (e) {
      showAlert('Error', 'Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerHint}>
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up!'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={16} color={colors.accent} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptyHint}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => {
            const iconColor = typeColors[item.type] || colors.muted;
            return (
              <View
                style={[
                  styles.notificationCard,
                  !item.isRead && styles.notificationUnread,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: iconColor + '22' }]}>
                  <Ionicons
                    name={item.type === 'warning' ? 'warning' : item.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                    size={20}
                    color={iconColor}
                  />
                </View>
                <View style={styles.notificationBody}>
                  <Text style={[styles.notificationTitle, !item.isRead && { color: colors.accent }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.notificationActions}>
                  {!item.isRead && (
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={() => markAsRead(item.id)}
                    >
                      <Ionicons name="checkmark" size={16} color={colors.green} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => deleteNotification(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
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
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  markAllText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notificationUnread: {
    borderColor: colors.accent,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBody: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  notificationMessage: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  notificationTime: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
  },
  notificationActions: {
    alignItems: 'center',
    gap: 8,
  },
  smallButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
});
