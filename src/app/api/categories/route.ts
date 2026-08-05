import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAm: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      include: { _count: { select: { menuItems: true } } },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(categories)
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
    const validated = createCategorySchema.parse(data)

    const maxOrder = await prisma.category.aggregate({
      _max: { order: true },
    })

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        nameAm: validated.nameAm || null,
        icon: validated.icon || null,
        order: validated.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
