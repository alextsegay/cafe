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
import { showToast } from '../utils/toast';
import { colors } from '../theme';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactScreen() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const res = await fetchWithAuth('/contact');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      showAlert('Error', 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/contact/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
        );
      }
    } catch (e) {
      showAlert('Error', 'Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    showAlert('Confirm Delete', 'Delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`/contact/${id}`, { method: 'DELETE' });
            if (res.ok) {
              setMessages((prev) => prev.filter((m) => m.id !== id));
              showToast('Message deleted');
            }
          } catch (e) {
            showAlert('Error', 'Failed to delete message');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerHint}>
        {messages.length} message{messages.length === 1 ? '' : 's'} received
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="mail-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptyHint}>Messages from your contact form will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMessages();
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.messageCard, item.isRead && styles.messageRead]}>
              <View style={styles.messageHeader}>
                <View style={styles.messageFrom}>
                  <Text style={styles.messageName}>{item.name}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <View style={styles.messageActions}>
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
                    onPress={() => deleteMessage(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>

              {item.email ? <Text style={styles.messageEmail}>{item.email}</Text> : null}
              {item.subject ? (
                <Text style={styles.messageSubject}>{item.subject}</Text>
              ) : null}
              <Text style={styles.messageBody}>{item.message}</Text>
              <Text style={styles.messageTime}>{formatDate(item.createdAt)}</Text>
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
  headerHint: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  messageRead: {
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  messageActions: {
    flexDirection: 'row',
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
  messageEmail: {
    color: colors.muted,
    fontSize: 13,
  },
  messageSubject: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  messageBody: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  messageTime: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 8,
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
