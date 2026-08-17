import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const platform = typeof body?.platform === 'string' ? body.platform : 'android'

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    await prisma.pushToken.upsert({
      where: { token },
      update: { platform, userId: user.id },
      create: { token, platform, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Register push token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token : ''

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    await prisma.pushToken.deleteMany({ where: { token, userId: user.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unregister push token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
