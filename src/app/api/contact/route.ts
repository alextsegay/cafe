import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import config from '@/lib/config'

async function sendPushNotifications(title: string, body: string) {
  try {
    const tokens = await prisma.pushToken.findMany({ select: { token: true } })
    if (tokens.length === 0) return

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data: { screen: 'Contact' },
    }))

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  } catch (error) {
    console.error('Failed to send push notifications:', error)
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch contact messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      )
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email || '',
        phone: phone || '',
        subject: subject || '',
        message,
      },
    })

    // Create notification for new message
    try {
      await prisma.notification.create({
        data: {
          type: 'info',
          title: config.cafe.name ? `New Contact Message for ${config.cafe.name}` : 'New Contact Message',
          message: `${name} sent a message: ${subject || 'No subject'}`,
        },
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't fail the message send if notification fails
    }

    // Push notification to the admin's devices
    await sendPushNotifications(
      config.cafe.name ? `New message for ${config.cafe.name}` : 'New Contact Message',
      `${name}: ${subject || message.slice(0, 80)}`
    )

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Failed to create contact message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}