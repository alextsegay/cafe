import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
  }
}
