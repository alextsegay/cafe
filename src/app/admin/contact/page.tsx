'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageSquare, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, { method: 'PATCH' })
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' })
      setMessages(messages.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No messages yet</h3>
          <p className="text-muted-foreground mt-2">Messages from your contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`glass rounded-2xl p-6 ${msg.isRead ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{msg.name}</h3>
                    {!msg.isRead && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.email}</p>
                  {msg.subject && (
                    <p className="text-sm font-medium mt-1">{msg.subject}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsRead(msg.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {msg.message}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(msg.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}