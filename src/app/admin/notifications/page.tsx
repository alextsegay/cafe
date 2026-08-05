'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Clock, AlertTriangle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No notifications</h3>
          <p className="text-muted-foreground mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border transition-all ${
                  !notification.isRead ? 'bg-white dark:bg-gray-800 border-amber-500/30 shadow-md' : getBgColor(notification.type)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${!notification.isRead ? 'bg-amber-100 dark:bg-amber-900/30' : ''}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
