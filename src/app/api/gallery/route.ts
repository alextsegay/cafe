import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gallery = await prisma.gallery.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const maxOrder = await prisma.gallery.aggregate({
      _max: { order: true },
    })
    
    const gallery = await prisma.gallery.create({
      data: {
        image: data.image,
        order: data.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Create gallery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
